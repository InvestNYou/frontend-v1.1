import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaArrowLeft } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import ProgressService from '../services/ProgressService';
import toast from 'react-hot-toast';

// Memoized Question Navigation Component
const QuestionNavigation = memo(({ 
  questions, 
  currentQuestion, 
  answers, 
  freeResponseAnswers, 
  onQuestionChange 
}) => {
  const isAnswered = useCallback((question) => {
    if (question.type === 'multiple_choice') {
      return answers[question.id] !== undefined;
    } else if (question.type === 'free_response' || question.type === 'short_answer') {
      const answer = freeResponseAnswers[question.id];
      return answer !== undefined && answer.trim() !== '';
    }
    return false;
  }, [answers, freeResponseAnswers]);

  return (
    <div className="flex space-x-2">
      {questions?.map((question, index) => (
        <button
          key={index}
          onClick={() => onQuestionChange(index)}
          className={`w-8 h-8 rounded-full text-sm font-medium ${
            index === currentQuestion
              ? 'bg-blue-500 text-white'
              : isAnswered(question)
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
});

// Memoized Progress Bar Component
const ProgressBar = memo(({ 
  answeredCount, 
  totalQuestions, 
  progressPercentage, 
  allAnswered 
}) => (
  <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
    <div className="flex justify-between text-sm text-gray-600 mb-2">
      <span>Progress</span>
      <span>{answeredCount} / {totalQuestions} answered</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
    {!allAnswered && (
      <div className="mt-2 text-sm text-orange-600">
        ⚠️ Please answer all questions before submitting
      </div>
    )}
  </div>
));

const Quiz = () => {
  const navigate = useNavigate();
  const { courseId, lessonId, quizId } = useParams();
  const { state, actions } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [freeResponseAnswers, setFreeResponseAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [detailedResults, setDetailedResults] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [isFirstTimePass, setIsFirstTimePass] = useState(false);

  // Memoized function to validate and normalize quiz data
  const validateQuizData = useCallback((quizData) => {
    try {
      console.debug('[Quiz] validateQuizData input', {
        isObject: typeof quizData === 'object' && quizData !== null,
        keys: quizData ? Object.keys(quizData) : null,
        hasQuestions: !!quizData?.questions,
        questionsIsArray: Array.isArray(quizData?.questions),
        questionsLength: Array.isArray(quizData?.questions) ? quizData.questions.length : null
      });
    } catch (_) {}
    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
      return null;
    }

    const validatedQuestions = quizData.questions.map((question, index) => {
      // Ensure question has required fields
      if (!question.id) {
        question.id = index + 1;
      }
      
      if (!question.type) {
        question.type = 'multiple_choice';
      }
      
      // Validate question type
      if (!['multiple_choice', 'free_response', 'short_answer'].includes(question.type)) {
        question.type = 'multiple_choice';
      }
      
      // Ensure multiple choice questions have options
      if (question.type === 'multiple_choice' && (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
        question.type = 'free_response';
      }
      
      return question;
    });

    const result = {
      ...quizData,
      questions: validatedQuestions
    };
    try {
      console.debug('[Quiz] validateQuizData output', {
        hasQuestions: Array.isArray(result.questions),
        questionsLength: result.questions.length
      });
    } catch (_) {}
    return result;
  }, []);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          navigate('/login', { replace: true });
          return;
        }

        if (!state.user) {
          navigate('/login', { replace: true });
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, state.user]);

  // Load quiz data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadQuiz = async () => {
      try {
        setLoading(true);
        
        // Fetch quiz from API
        const quizData = await ProgressService.getQuiz(quizId);
        console.debug('[Quiz] Fetched quizData', {
          type: typeof quizData,
          keys: quizData ? Object.keys(quizData) : null,
          hasQuestions: !!quizData?.questions,
          questionsIsArray: Array.isArray(quizData?.questions),
          questionsLength: Array.isArray(quizData?.questions) ? quizData.questions.length : null
        });
        
        // Log each question for debugging
        if (quizData.questions) {
          quizData.questions.forEach((q, index) => {
            try {
              console.debug('[Quiz] Question preview', {
                index,
                type: q?.type,
                hasOptions: Array.isArray(q?.options),
                optionsLength: Array.isArray(q?.options) ? q.options.length : null
              });
            } catch (_) {}
          });
        }
        
        // Validate and normalize quiz data
        const validatedQuiz = validateQuizData(quizData);
        if (validatedQuiz) {
          console.debug('[Quiz] Validation succeeded');
          setQuiz(validatedQuiz);
        } else {
          console.error('[Quiz] Validation failed - invalid structure', {
            hasQuestions: !!quizData?.questions,
            questionsIsArray: Array.isArray(quizData?.questions)
          });
          throw new Error('Invalid quiz data structure');
        }
      } catch (error) {
        console.error('[Quiz] Load error', { message: error.message, stack: error.stack });
        toast.error(`Failed to load quiz: ${error.message}`);
        navigate(`/course/${courseId}/lesson/${lessonId}`);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [isAuthenticated, courseId, lessonId, quizId, navigate]);

  // Timer removed - no time limit on quizzes

  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleFreeResponseChange = useCallback((questionId, answer) => {
    setFreeResponseAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (quiz?.questions && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [quiz?.questions, currentQuestion]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const validateAllQuestionsAnswered = useMemo(() => {
    if (!quiz?.questions) return false;
    
    return quiz.questions.every(question => {
      if (question.type === 'multiple_choice') {
        return answers[question.id] !== undefined;
      } else if (question.type === 'free_response' || question.type === 'short_answer') {
        const answer = freeResponseAnswers[question.id];
        return answer !== undefined && answer.trim() !== '';
      }
      return false;
    });
  }, [quiz?.questions, answers, freeResponseAnswers]);

  const getUnansweredQuestions = useMemo(() => {
    if (!quiz?.questions) return [];
    
    return quiz.questions.filter(question => {
      if (question.type === 'multiple_choice') {
        return answers[question.id] === undefined;
      } else if (question.type === 'free_response' || question.type === 'short_answer') {
        const answer = freeResponseAnswers[question.id];
        return answer === undefined || answer.trim() === '';
      }
      return true;
    });
  }, [quiz?.questions, answers, freeResponseAnswers]);

  const handleSubmitQuiz = useCallback(async () => {
    if (quizCompleted) return;

    // Validate that all questions are answered
    if (!validateAllQuestionsAnswered) {
      const unansweredNumbers = getUnansweredQuestions.map(q => 
        quiz.questions.findIndex(question => question.id === q.id) + 1
      );
      
      // Navigate to the first unanswered question
      if (getUnansweredQuestions.length > 0) {
        const firstUnansweredIndex = quiz.questions.findIndex(question => 
          question.id === getUnansweredQuestions[0].id
        );
        setCurrentQuestion(firstUnansweredIndex);
      }
      
      toast.error(`Please answer all questions before submitting. Missing: Questions ${unansweredNumbers.join(', ')}`);
      return;
    }

    try {
      // Check authentication before submitting
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      
      setQuizCompleted(true);
      
      // Debug: Log what we're sending
      const submissionData = {
        answers: { ...answers, ...freeResponseAnswers }
      };
      
      
      // Submit quiz attempt - let the backend handle AI grading
      const response = await ProgressService.submitQuizAttempt(quizId, submissionData);
      
      
      // Use the score from the backend response
      setScore(response.score);
      setXpEarned(response.xpEarned || 0);
      setIsFirstTimePass(response.isFirstTimePass || false);
      
      if (response.xpEarned && response.xpEarned > 0) {
        toast.success(`+${response.xpEarned} XP earned!`);
        actions.addXp(response.xpEarned);
        
        if (response.newLevel > state.progress?.level) {
          toast.success(`🎉 Level Up! You're now level ${response.newLevel}!`);
        }
      } else if (response.passed && !response.isFirstTimePass) {
        toast('Quiz passed! (No XP - already completed before)');
      } else if (!response.passed) {
        toast.error('Quiz failed. No XP awarded. Try again!');
      }
      
      // Store detailed results for display
      if (response.detailedResults) {
        setDetailedResults(response.detailedResults);
      }
      
      setShowResults(true);
    } catch (error) {
      // More specific error messages
      if (error.message.includes('Failed to fetch')) {
        toast.error('Unable to connect to server. Please check your internet connection and ensure the backend is running.');
      } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.message.includes('404')) {
        toast.error('Quiz not found. Please try again.');
      } else {
        toast.error(`Failed to submit quiz: ${error.message}`);
      }
      
      // Allow user to retry
      setQuizCompleted(false);
    }
  }, [quizCompleted, validateAllQuestionsAnswered, getUnansweredQuestions, quiz, navigate, actions, state.progress?.level]);

  // Memoized calculations for better performance
  const currentQ = useMemo(() => quiz?.questions?.[currentQuestion], [quiz?.questions, currentQuestion]);
  
  const answeredQuestionsCount = useMemo(() => {
    if (!quiz?.questions) return 0;
    return quiz.questions.filter(q => {
      if (q.type === 'multiple_choice') {
        return answers[q.id] !== undefined;
      } else if (q.type === 'free_response' || q.type === 'short_answer') {
        const answer = freeResponseAnswers[q.id];
        return answer !== undefined && answer.trim() !== '';
      }
      return false;
    }).length;
  }, [quiz?.questions, answers, freeResponseAnswers]);

  const progressPercentage = useMemo(() => {
    if (!quiz?.questions?.length) return 0;
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  }, [currentQuestion, quiz?.questions?.length]);

  // formatTime function removed - no time limit needed

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
          <button
            onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
            className="btn btn-primary"
          >
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  navigate(`/course/${courseId}/lesson/${lessonId}`, { replace: true });
                  window.location.reload();
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-sm text-center"
          >
            <div className="text-6xl mb-4">
              {score >= quiz.passingScore ? '🎉' : '📚'}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {score >= quiz.passingScore ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <div className="text-4xl font-bold mb-4">
              <span className={score >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}>
                {score}%
              </span>
            </div>
            
            <p className="text-lg text-gray-600 mb-6">
              {score >= quiz.passingScore 
                ? xpEarned > 0 
                  ? `You passed! You scored ${score}% and earned ${xpEarned} XP!`
                  : `You passed! You scored ${score}%. (No XP - already completed before)`
                : `You scored ${score}%. You need ${quiz.passingScore}% to pass. Review the lesson and try again!`
              }
            </p>

            {/* Enhanced Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{score}%</div>
                <div className="text-sm text-blue-800">Overall Score</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {detailedResults ? detailedResults.filter(r => r.isCorrect).length : 0}
                </div>
                <div className="text-sm text-green-800">Correct Answers</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{quiz.questions?.length || 0}</div>
                <div className="text-sm text-purple-800">Total Questions</div>
              </div>
            </div>

            {/* Question Type Performance */}
            {detailedResults && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance by Question Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const questionTypes = {};
                    detailedResults.forEach(result => {
                      const question = quiz.questions.find(q => q.id === result.questionId);
                      if (question) {
                        if (!questionTypes[question.type]) {
                          questionTypes[question.type] = { correct: 0, total: 0, scores: [] };
                        }
                        questionTypes[question.type].total++;
                        questionTypes[question.type].scores.push(result.score);
                        if (result.isCorrect) {
                          questionTypes[question.type].correct++;
                        }
                      }
                    });

                    return Object.entries(questionTypes).map(([type, data]) => {
                      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
                      const percentage = Math.round((data.correct / data.total) * 100);
                      
                      return (
                        <div key={type} className="bg-white p-4 rounded-lg">
                          <div className="text-lg font-semibold text-gray-900 capitalize">
                            {type.replace('_', ' ')}
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{avgScore}%</div>
                          <div className="text-sm text-gray-600">
                            {data.correct}/{data.total} correct ({percentage}%)
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Performance Insights */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h3>
              <div className="space-y-3 text-left">
                {score >= 90 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <span className="text-lg">🌟</span>
                    <span>Excellent work! You have a strong understanding of the material.</span>
                  </div>
                )}
                {score >= 70 && score < 90 && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <span className="text-lg">👍</span>
                    <span>Good job! You understand the key concepts well.</span>
                  </div>
                )}
                {score < 70 && (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <span className="text-lg">💪</span>
                    <span>Keep studying! Review the lesson content and try again.</span>
                  </div>
                )}
                
                {detailedResults && (
                  <>
                    {detailedResults.filter(r => r.score >= 90).length > 0 && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <span className="text-lg">✨</span>
                        <span>You excelled on {detailedResults.filter(r => r.score >= 90).length} question(s)!</span>
                      </div>
                    )}
                    {detailedResults.filter(r => r.score < 50).length > 0 && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <span className="text-lg">📖</span>
                        <span>Consider reviewing {detailedResults.filter(r => r.score < 50).length} question(s) more carefully.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quiz Performance Metrics */}
            <div className="bg-yellow-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Completed</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">Questions Answered</div>
                  <div className="text-2xl font-bold text-blue-600">{quiz.questions?.length || 0}</div>
                  <div className="text-sm text-gray-600">total questions</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">Quiz Type</div>
                  <div className="text-2xl font-bold text-green-600">Mixed</div>
                  <div className="text-sm text-gray-600">multiple choice & open-ended</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  navigate(`/course/${courseId}/lesson/${lessonId}`, { replace: true });
                  window.location.reload();
                }}
                className="btn btn-secondary"
              >
                Back to Lesson
              </button>
              {score < quiz.passingScore && (
                <button
                  onClick={() => {
                    setShowResults(false);
                    setQuizCompleted(false);
                    setAnswers({});
                    setFreeResponseAnswers({});
                    setCurrentQuestion(0);
                    setDetailedResults(null);
                    setScore(null);
                    setXpEarned(0);
                    setIsFirstTimePass(false);
                  }}
                  className="btn btn-primary"
                >
                  Retake Quiz
                </button>
              )}
              {score >= quiz.passingScore && (
                <button
                  onClick={() => {
                    // Share results functionality
                    const shareText = `I just scored ${score}% on the "${quiz.title}" quiz! 🎉`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Quiz Results',
                        text: shareText,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      toast.success('Results copied to clipboard!');
                    }
                  }}
                  className="btn btn-outline"
                >
                  Share Results
                </button>
              )}
            </div>
          </motion.div>

          {/* Question Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-8 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h3>
            <div className="space-y-6">
              {quiz.questions?.map((question, index) => {
                // Get detailed result for this question if available
                const questionResult = detailedResults?.find(r => r.questionId === question.id);
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        Question {index + 1}: {question.question}
                      </h4>
                      {questionResult && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          questionResult.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {questionResult.score}%
                        </div>
                      )}
                    </div>
                    
                    {question.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : answers[question.id] === optionIndex && optionIndex !== question.correctAnswer
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-50'
                            }`}
                          >
                            {option}
                            {optionIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-600">✓ Correct</span>
                            )}
                            {answers[question.id] === optionIndex && optionIndex !== question.correctAnswer && (
                              <span className="ml-2 text-red-600">✗ Your Answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : question.type === 'free_response' ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <strong className="text-gray-700">Your Answer:</strong>
                          <p className="mt-1 text-gray-800">
                            {freeResponseAnswers[question.id] || 'No answer provided'}
                          </p>
                        </div>
                        
                        {/* AI Feedback */}
                        {questionResult && (
                          <div className={`p-3 rounded ${
                            questionResult.isCorrect 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-yellow-50 border border-yellow-200'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`font-medium ${
                                questionResult.isCorrect ? 'text-green-800' : 'text-yellow-800'
                              }`}>
                                AI Feedback:
                              </span>
                              <span className={`text-sm ${
                                questionResult.isCorrect ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {questionResult.feedback}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              <strong>Explanation:</strong> {questionResult.explanation}
                            </p>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <strong className="text-blue-700">Reference Answer:</strong>
                          <p className="mt-1 text-blue-800">{question.correctAnswer}</p>
                        </div>
                      </div>
                    ) : question.type === 'short_answer' ? (
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <strong className="text-gray-700">Your Answer:</strong>
                          <p className="mt-1 text-gray-800 font-medium">
                            {freeResponseAnswers[question.id] || 'No answer provided'}
                          </p>
                        </div>
                        
                        {/* AI Feedback */}
                        {questionResult && (
                          <div className={`p-3 rounded ${
                            questionResult.isCorrect 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-yellow-50 border border-yellow-200'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`font-medium ${
                                questionResult.isCorrect ? 'text-green-800' : 'text-yellow-800'
                              }`}>
                                AI Feedback:
                              </span>
                              <span className={`text-sm ${
                                questionResult.isCorrect ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {questionResult.feedback}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              <strong>Explanation:</strong> {questionResult.explanation}
                            </p>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <strong className="text-blue-700">Reference Answer:</strong>
                          <p className="mt-1 text-blue-800">{question.correctAnswer}</p>
                        </div>
                      </div>
                    ) : null}
                    
                    {!questionResult && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="nav-bottom">
          <button onClick={() => navigate('/dashboard')} className="nav-item">
            <FaHome className="text-xl mb-1" />
            <span>Home</span>
          </button>
          <button onClick={() => navigate('/learn')} className="nav-item active">
            <FaGraduationCap className="text-xl mb-1" />
            <span>Learn</span>
          </button>
          <button onClick={() => navigate('/ask')} className="nav-item">
            <FaQuestionCircle className="text-xl mb-1" />
            <span>Ask</span>
          </button>
          <button onClick={() => navigate('/portfolio')} className="nav-item">
            <FaChartLine className="text-xl mb-1" />
            <span>Portfolio</span>
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !currentQ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 content-with-nav pb-20">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(`/course/${courseId}/lesson/${lessonId}`)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions?.length || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Level {state.progress?.level || 1}
              </div>
              <div className="text-xs text-gray-500">
                {state.progress?.xp || 0} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Progress Bar */}
        <ProgressBar 
          answeredCount={answeredQuestionsCount}
          totalQuestions={quiz.questions?.length || 0}
          progressPercentage={progressPercentage}
          allAnswered={validateAllQuestionsAnswered}
        />

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-8 shadow-sm mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQ.question}
          </h2>

          {currentQ.type === 'multiple_choice' ? (
            <div className="space-y-3">
              {currentQ.options && currentQ.options.length > 0 ? (
                currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQ.id] === index
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQ.id] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQ.id] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-red-500 italic">
                  No options available for this multiple choice question
                </div>
              )}
            </div>
          ) : currentQ.type === 'free_response' ? (
            <div className="space-y-4">
              <textarea
                value={freeResponseAnswers[currentQ.id] || ''}
                onChange={(e) => handleFreeResponseChange(currentQ.id, e.target.value)}
                placeholder="Type your detailed answer here..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                style={{ minHeight: '120px' }}
              />
              <div className="text-sm text-gray-500">
                {freeResponseAnswers[currentQ.id]?.length || 0} characters
              </div>
            </div>
          ) : currentQ.type === 'short_answer' ? (
            <div className="space-y-4">
              <input
                type="text"
                value={freeResponseAnswers[currentQ.id] || ''}
                onChange={(e) => handleFreeResponseChange(currentQ.id, e.target.value)}
                placeholder="Type your short answer here..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                maxLength={200}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Short answer (be concise and precise)</span>
                <span>{freeResponseAnswers[currentQ.id]?.length || 0}/200 characters</span>
              </div>
            </div>
          ) : (
            <div className="text-red-500 italic p-4 bg-red-50 rounded-lg">
              <div className="font-semibold">Unsupported question type: {currentQ.type}</div>
              <div className="text-sm mt-1">Supported types: multiple_choice, free_response, short_answer</div>
              <div className="text-sm mt-1">Question ID: {currentQ.id}</div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <FaArrowLeft className="text-sm" />
            <span>Previous</span>
          </button>

          <QuestionNavigation
            questions={quiz.questions}
            currentQuestion={currentQuestion}
            answers={answers}
            freeResponseAnswers={freeResponseAnswers}
            onQuestionChange={setCurrentQuestion}
          />

          {currentQuestion === (quiz.questions?.length || 0) - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={!validateAllQuestionsAnswered}
              className={`btn ${
                validateAllQuestionsAnswered 
                  ? 'btn-primary' 
                  : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              {validateAllQuestionsAnswered ? 'Submit Quiz' : 'Complete All Questions'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="nav-bottom">
        <button onClick={() => navigate('/dashboard')} className="nav-item">
          <FaHome className="text-xl mb-1" />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/learn')} className="nav-item active">
          <FaGraduationCap className="text-xl mb-1" />
          <span>Learn</span>
        </button>
        <button onClick={() => navigate('/ask')} className="nav-item">
          <FaQuestionCircle className="text-xl mb-1" />
          <span>Ask</span>
        </button>
        <button onClick={() => navigate('/portfolio')} className="nav-item">
          <FaChartLine className="text-xl mb-1" />
          <span>Portfolio</span>
        </button>
      </div>
    </div>
  );
};

// Error Boundary Component
class QuizErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Quiz Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">There was an error loading the quiz.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export with error boundary
const QuizWithErrorBoundary = () => (
  <QuizErrorBoundary>
    <Quiz />
  </QuizErrorBoundary>
);

export default QuizWithErrorBoundary;


import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaArrowLeft, FaArrowRight, FaCheckCircle, FaTrophy } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import CourseService from '../services/CourseService';
import ProgressService from '../services/ProgressService';
import toast from 'react-hot-toast';

const Lesson = () => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const { state, actions } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quiz, setQuiz] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);

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

  // Load course and lesson data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load course details
        const courseData = await CourseService.getCourse(courseId);
        setCourse(courseData.course); // API returns { course: {...} }
        
        // Flatten all lessons from units into a single array (3-tier structure)
        const allLessons = courseData.course.units?.flatMap(unit => unit.lessons) || [];
        setLessons(allLessons);
        
        // Find current lesson
        const lessonIndex = allLessons.findIndex(l => l.id === parseInt(lessonId));
        if (lessonIndex !== -1) {
          setCurrentLessonIndex(lessonIndex);
          const currentLesson = allLessons[lessonIndex];
          setLesson(currentLesson);
          
          // Load quiz for this lesson if it exists
          
          if (currentLesson.quizzes && currentLesson.quizzes.length > 0) {
            setQuiz(currentLesson.quizzes[0]);
          } else {
            toast.error(`No quiz available for this lesson yet. Please contact support.`);
          }
          
          // Load quiz attempts for this lesson
          loadQuizAttempts(currentLesson.id);
        } else {
          toast.error('Lesson not found');
          navigate(`/course/${courseId}`);
        }
      } catch (error) {
        toast.error('Failed to load lesson');
        navigate('/learn');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, courseId, lessonId, navigate]);

  const handleCompleteLesson = async () => {
    console.log('[Lesson] handleCompleteLesson called');
    console.log('[Lesson] Lesson object:', lesson);
    console.log('[Lesson] Lesson ID:', lesson?.id);
    console.log('[Lesson] Lesson ID type:', typeof lesson?.id);
    console.log('[Lesson] Is completed:', lesson?.isCompleted);
    
    if (!lesson || lesson.isCompleted) {
      console.log('[Lesson] Skipping - lesson is null or already completed');
      return;
    }

    try {
      console.log('[Lesson] Calling ProgressService.completeLesson with:', lesson.id);
      const response = await ProgressService.completeLesson(lesson.id);
      console.log('[Lesson] Response received:', response);
      
      if (response.xpEarned) {
        toast.success(`+${response.xpEarned} XP earned!`);
        
        // Update local state
        actions.completeLesson(lesson.id);
        actions.addXp(response.xpEarned);
        
        // Check if user leveled up
        if (response.newLevel > state.progress?.level) {
          toast.success(`🎉 Level Up! You're now level ${response.newLevel}!`);
        }
        
        // Update lesson completion status
        setLesson({ ...lesson, isCompleted: true });
        
        // Update lessons array
        const updatedLessons = lessons.map(l => 
          l.id === lesson.id ? { ...l, isCompleted: true } : l
        );
        setLessons(updatedLessons);
        
        // Also update the course data to reflect the change
        if (course) {
          const updatedCourse = {
            ...course,
            units: course.units.map(unit => ({
              ...unit,
              lessons: unit.lessons.map(l => 
                l.id === lesson.id ? { ...l, isCompleted: true } : l
              )
            }))
          };
          setCourse(updatedCourse);
        }
      }
    } catch (error) {
      console.error('[Lesson] Error in handleCompleteLesson:', error);
      console.error('[Lesson] Error message:', error.message);
      console.error('[Lesson] Error stack:', error.stack);
      
      // If lesson is already completed, update UI to reflect this
      if (error.message && error.message.includes('already completed')) {
        console.log('[Lesson] Lesson already completed - updating UI');
        setLesson({ ...lesson, isCompleted: true });
        const updatedLessons = lessons.map(l => 
          l.id === lesson.id ? { ...l, isCompleted: true } : l
        );
        setLessons(updatedLessons);
        if (course) {
          const updatedCourse = {
            ...course,
            units: course.units.map(unit => ({
              ...unit,
              lessons: unit.lessons.map(l => 
                l.id === lesson.id ? { ...l, isCompleted: true } : l
              )
            }))
          };
          setCourse(updatedCourse);
        }
        toast.success('Lesson already completed');
      } else {
        toast.error(error.message || 'Failed to complete lesson');
      }
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = lessons[currentLessonIndex - 1];
      navigate(`/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  const loadQuizAttempts = async (lessonId) => {
    try {
      const attempts = await ProgressService.getLessonQuizAttempts(lessonId);
      setQuizAttempts(attempts);
    } catch (error) {
      // Don't show error to user, just log it
    }
  };


  const handleTakeQuiz = () => {
    if (quiz) {
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${quiz.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h2>
          <button
            onClick={() => navigate('/learn')}
            className="btn btn-primary"
          >
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 content-with-nav">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(`/course/${courseId}`)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-sm text-gray-600">Lesson {currentLessonIndex + 1} of {lessons.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Level {state.progress?.level || 1}
              </div>
              <div className="text-xs text-gray-500">
                {state.progress?.xp || 0} XP
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaGraduationCap className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Lesson Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
            {lesson.isCompleted && (
              <div className="flex items-center space-x-2 text-green-600">
                <FaCheckCircle className="text-lg" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>

          {/* Lesson Content with Enhanced formatting */}
          <div className="prose prose-lg max-w-none">
            {lesson.content.split('\n').map((line, index) => {
              // Clean up the line first
              let cleanLine = line.trim();
              
              // Handle headers
              if (cleanLine.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">{cleanLine.substring(2)}</h1>;
              } else if (cleanLine.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-6">{cleanLine.substring(3)}</h2>;
              } else if (cleanLine.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-5">{cleanLine.substring(4)}</h3>;
              } else if (cleanLine.startsWith('#### ')) {
                return <h4 key={index} className="text-lg font-semibold text-gray-900 mb-2 mt-4">{cleanLine.substring(5)}</h4>;
              } 
              // Handle bullet points with labels (cleaned format)
              else if (cleanLine.startsWith('- ') && cleanLine.includes(':')) {
                const content = cleanLine.substring(2);
                const colonIndex = content.indexOf(':');
                if (colonIndex > 0) {
                  const label = content.substring(0, colonIndex);
                  const rest = content.substring(colonIndex + 1).trim();
                  return (
                    <div key={index} className="flex mb-3">
                      <span className="font-semibold text-gray-900 mr-2 min-w-fit">• {label}:</span>
                      <span className="text-gray-700">{rest}</span>
                    </div>
                  );
                }
              } 
              // Handle regular bullet points
              else if (cleanLine.startsWith('- ')) {
                const content = cleanLine.substring(2);
                return (
                  <div 
                    key={index} 
                    className="ml-4 mb-3 text-gray-700"
                  >
                    • {content}
                  </div>
                );
              } 
              // Handle standalone bold text
              else if (cleanLine.startsWith('**') && cleanLine.endsWith('**') && cleanLine.length > 4) {
                return <div key={index} className="font-semibold text-gray-900 mb-4">{cleanLine.substring(2, cleanLine.length - 2)}</div>;
              } 
              // Handle empty lines
              else if (cleanLine === '') {
                return <div key={index} className="mb-3"></div>;
              } 
              // Handle tables - improved table rendering
              else if (cleanLine.startsWith('|')) {
                // Check if this is a table header or separator
                if (cleanLine.includes('---') || cleanLine.match(/^\|[\s\-\|]+\|$/)) {
                  return <div key={index} className="border-b border-gray-300 my-3"></div>;
                }
                
                // Parse table row
                const cells = cleanLine.split('|').slice(1, -1).map(cell => cell.trim());
                const isHeader = index > 0 && lesson.content.split('\n')[index - 1].trim().startsWith('|') && 
                                 !lesson.content.split('\n')[index - 1].includes('---');
                
                return (
                  <div key={index} className={`flex ${isHeader ? 'font-semibold bg-gray-50' : ''} mb-1`}>
                    {cells.map((cell, cellIndex) => (
                      <div key={cellIndex} className={`flex-1 p-3 ${cellIndex < cells.length - 1 ? 'border-r border-gray-200' : ''}`}>
                        {cell}
                      </div>
                    ))}
                  </div>
                );
              } 
              // Handle numbered lists
              else if (cleanLine.match(/^\d+\.\s/)) {
                const content = cleanLine.replace(/^\d+\.\s/, '');
                return (
                  <div 
                    key={index} 
                    className="ml-4 mb-3 text-gray-700"
                  >
                    {cleanLine.split('.')[0]}. {content}
                  </div>
                );
              }
              // Handle code blocks
              else if (cleanLine.startsWith('```')) {
                return <div key={index} className="bg-gray-100 p-4 rounded-lg my-4 font-mono text-sm"></div>;
              }
              // Handle regular paragraphs
              else {
                return (
                  <p 
                    key={index} 
                    className="text-gray-700 mb-4 leading-relaxed"
                  >
                    {cleanLine}
                  </p>
                );
              }
            })}
          </div>
        </motion.div>

        {/* Quiz Results Section */}
        {quizAttempts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaTrophy className="text-yellow-500 mr-2" />
              Quiz Results
            </h3>
            
            <div className="space-y-3">
              {quizAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    attempt.passed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      attempt.passed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {attempt.score}%
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Attempt #{quizAttempts.length - index}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString()}
                      </div>
                      {attempt.timeSpent && (
                        <div className="text-xs text-gray-500">
                          Completed in {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      attempt.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.passed ? 'PASSED' : 'FAILED'}
                    </div>
                    {attempt.feedback && (
                      <div className="text-sm text-gray-600 mt-1">
                        {attempt.feedback}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {quizAttempts.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Best Score:</strong> {Math.max(...quizAttempts.map(a => a.score))}%
                </div>
                <div className="text-sm text-blue-800">
                  <strong>Attempts:</strong> {quizAttempts.length}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Lesson Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousLesson}
            disabled={currentLessonIndex === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentLessonIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <FaArrowLeft className="text-sm" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            {!lesson.isCompleted && (
              <button
                onClick={handleCompleteLesson}
                className="btn btn-primary"
              >
                Complete Lesson (+{lesson.xpValue} XP)
              </button>
            )}
            
            {lesson.isCompleted && quiz && (
              <button
                onClick={handleTakeQuiz}
                className="btn btn-secondary"
              >
                Take Quiz (+{quiz.xpValue} XP)
              </button>
            )}
            
            {/* Debug info */}
            {lesson.isCompleted && !quiz && (
              <div className="text-sm text-gray-500">
                Debug: Lesson completed but no quiz found. Quiz state: {quiz ? 'exists' : 'null'}
              </div>
            )}
            
            <button
              onClick={goToNextLesson}
              disabled={currentLessonIndex === lessons.length - 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentLessonIndex === lessons.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>Next</span>
              <FaArrowRight className="text-sm" />
            </button> 
          </div>
        </div>

        {/* Course Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Course Progress</h3>
          <div className="space-y-2">
            {lessons.map((l, index) => (
              <div
                key={l.id}
                onClick={() => navigate(`/course/${courseId}/lesson/${l.id}`)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  l.id === lesson.id
                    ? 'bg-blue-50 border border-blue-200'
                    : l.isCompleted
                    ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  l.isCompleted
                    ? 'bg-green-500 text-white'
                    : l.id === lesson.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {l.isCompleted ? <FaCheckCircle className="text-xs" /> : index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{l.title}</div>
                  <div className="text-sm text-gray-500">
                    {l.isCompleted ? 'Completed - Click to revisit' : l.id === lesson.id ? 'Current' : 'Not started'}
                  </div>
                </div>
                {l.isCompleted && <FaCheckCircle className="text-green-500" />}
              </div>
            ))}
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
};

export default Lesson;

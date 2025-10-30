import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaArrowLeft, FaCheckCircle, FaLock, FaPlay } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import CourseService from '../services/CourseService';
import toast from 'react-hot-toast';

const Course = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { state } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

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

  // Load course data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCourse = async () => {
      try {
        setLoading(true);
        const courseData = await CourseService.getCourse(courseId);
        setCourse(courseData.course); // API returns { course: {...} }
      } catch (error) {
        toast.error('Failed to load course');
        navigate('/learn');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [isAuthenticated, courseId, navigate]);

  const getProgressColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || 'bg-blue-500';
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800'
    };
    return colors[color] || 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
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
              onClick={() => navigate('/learn')}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-sm text-gray-600">{course.lessons?.length || 0} lessons</p>
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
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 shadow-sm mb-6"
        >
          <div className="flex items-start space-x-6">
            <div className="text-6xl">{course.thumbnail}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h2>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {course.units?.flatMap(unit => unit.lessons).length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {course.units?.flatMap(unit => unit.lessons).reduce((sum, lesson) => sum + (lesson.xpValue || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {course.units?.flatMap(unit => unit.lessons).filter(l => l.isCompleted).length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Course Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Course Content</h3>
          
          {/* Units (3-tier structure) */}
          {course.units && course.units.length > 0 && (
            <div className="space-y-6">
              {course.units.map((unit, unitIndex) => (
                <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium">
                      {unitIndex + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{unit.title}</h4>
                      <p className="text-sm text-gray-600">{unit.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-11">
                    {unit.lessons?.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (!lesson.isLocked) {
                            navigate(`/course/${courseId}/lesson/${lesson.id}`);
                          }
                        }}
                        className={`flex items-center space-x-4 p-3 rounded-lg border transition-all ${
                          lesson.isCompleted
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer'
                            : lesson.isLocked
                            ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          lesson.isCompleted
                            ? 'bg-green-500 text-white'
                            : lesson.isLocked
                            ? 'bg-gray-300 text-gray-600'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {lesson.isCompleted ? <FaCheckCircle className="text-xs" /> : lessonIndex + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900 text-sm">{lesson.title}</h5>
                              <p className="text-xs text-gray-500">+{lesson.xpValue || 0} XP</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {lesson.isCompleted && (
                                <span className="text-green-600 text-xs font-medium">Completed</span>
                              )}
                              {lesson.isLocked && (
                                <span className="text-gray-500 text-xs">Locked</span>
                              )}
                              {!lesson.isCompleted && !lesson.isLocked && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/course/${courseId}/lesson/${lesson.id}`);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                >
                                  <FaPlay className="text-xs" />
                                  <span>Start</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
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

export default Course;


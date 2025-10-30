import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaCheckCircle, FaLock } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import CourseService from '../services/CourseService';
import toast from 'react-hot-toast';
import './Learning.css';

const Learning = () => {
  const navigate = useNavigate();
  const { state } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);


  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
          navigate('/login', { replace: true });
          return;
        }

        // Check if user exists in context
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

  // Fetch courses from backend
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const coursesData = await CourseService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        toast.error('Failed to load courses');
        
        // Fallback to empty array
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [isAuthenticated]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="learning-loading">
        <div className="learning-loading-content">
          <div className="learning-spinner"></div>
          <p className="learning-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="learning-container learning-content">
      {/* Top Bar */}
      <div className="learning-top-bar">
        <div className="learning-top-content">
          <div className="learning-top-left">
            <button onClick={() => navigate('/dashboard')} className="learning-back-button">
              ← Back
            </button>
            <h1 className="learning-title">Learning</h1>
          </div>
        </div>
      </div>

      <div className="learning-main">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="learning-header"
        >
          <h2 className="learning-header-title">
            Choose Your Learning Path
          </h2>
          <p className="learning-header-subtitle">
            Master financial literacy at your own pace
          </p>
        </motion.div>

        {/* Course Grid */}
        {coursesLoading ? (
          <div className="learning-courses-loading">
            <div className="learning-courses-spinner"></div>
            <p className="learning-courses-loading-text">Loading courses...</p>
          </div>
        ) : (
          <div className="learning-courses-grid">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`learning-course-card ${course.isLocked ? 'locked' : ''}`}
                onClick={() => {
                  if (!course.isLocked) {
                    navigate(`/course/${course.id}`);
                  }
                }}
              >
                <div className="learning-course-content">
                  <div className="learning-course-thumbnail">{course.thumbnail}</div>
                  
                  <div className="learning-course-info">
                    <div className="learning-course-header">
                      <h3 className="learning-course-title">
                        {course.title}
                      </h3>
                      {course.isLocked && (
                        <FaLock className="learning-course-icon" />
                      )}
                      {course.completedLessons === course.lessonsCount && course.lessonsCount > 0 && (
                        <FaCheckCircle className="learning-course-icon completed" />
                      )}
                    </div>
                    
                    <p className="learning-course-description">
                      {course.description}
                    </p>
                    
                    <div className="learning-course-footer">
                      <div className="learning-course-stats">
                        <div className="learning-course-lessons">
                          {course.completedLessons || 0}/{course.lessonsCount || 0} lessons
                        </div>
                        
                        <div className="learning-course-progress-container">
                          <div
                            className={`learning-course-progress-bar ${course.color}`}
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className={`learning-course-status ${course.color}`}>
                        {course.isLocked ? 'Locked' : 
                         course.completedLessons === course.lessonsCount && course.lessonsCount > 0 ? 'Complete' : 'Start'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Learning Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="learning-tips"
        >
          <h3 className="learning-tips-title">💡 Learning Tips</h3>
          <ul className="learning-tips-list">
            <li>• Complete lessons in order for the best learning experience</li>
            <li>• Take notes and review key concepts regularly</li>
            <li>• Practice with the portfolio simulator after completing 2 courses</li>
            <li>• Ask questions anytime using the Ask feature</li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="nav-bottom">
        <button onClick={() => navigate('/dashboard')} className="nav-item">
          <FaHome className="text-xl mb-1" />
          <span>Home</span>
        </button>
        <button className="nav-item active">
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

export default Learning;

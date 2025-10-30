import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import './tailwind-utilities.css';

// Components
import WelcomeScreen from './components/WelcomeScreen';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Learning from './components/Learning';
import Course from './components/Course';
import Lesson from './components/Lesson';
import Quiz from './components/Quiz';
import AskFeature from './components/AskFeature';
import Portfolio from './components/Portfolio';
import Watchlist from './components/Watchlist';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import AuthChecker from './components/AuthChecker';
import { UserProvider } from './context/UserContext';
import AuthService from './services/AuthService';

function App() {
  return (
    <UserProvider>
      <AuthChecker>
        <Router>
          <div className="App">
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={
              <AuthGuard>
                <Login />
              </AuthGuard>
            } />
            <Route path="/signup" element={
              <AuthGuard>
                <SignUp />
              </AuthGuard>
            } />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/learn" element={
              <ProtectedRoute>
                <Learning />
              </ProtectedRoute>
            } />
            <Route path="/course/:courseId" element={
              <ProtectedRoute>
                <Course />
              </ProtectedRoute>
            } />
            <Route path="/course/:courseId/lesson/:lessonId" element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            } />
            <Route path="/course/:courseId/lesson/:lessonId/quiz/:quizId" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />
            <Route path="/ask" element={
              <ProtectedRoute>
                <AskFeature />
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* Catch-all route for client-side routing */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthChecker>
    </UserProvider>
  );
}

export default App;

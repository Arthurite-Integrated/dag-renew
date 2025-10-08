import React, { useState, useEffect } from 'react';
import AuthPage from '../components/AuthPage';
import AttendanceCamera from '../components/AttendanceCamera';
import AdminDashboard from '../components/AdminDashboard';
import { UserSession } from '../types';
import { saveUserSession, getUserSession, clearUserSession } from '../utils/auth';

const AttendanceApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'auth' | 'user' | 'admin'>('auth');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const existingSession = getUserSession();
        if (existingSession) {
          console.log('Found existing session:', existingSession);
          setUserSession(existingSession);
          setCurrentPage(existingSession.role === 'admin' ? 'admin' : 'user');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        // Clear any corrupted session data
        clearUserSession();
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to prevent flash of auth page
    const timer = setTimeout(checkExistingSession, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: 'user' | 'admin', email: string) => {
    const session: UserSession = {
      role,
      email,
      loginTime: new Date().toISOString()
    };

    // Save session to localStorage
    saveUserSession(session);
    setUserSession(session);
    setCurrentPage(role === 'admin' ? 'admin' : 'user');

    console.log('User logged in:', session);
  };

  const handleLogout = () => {
    // Clear session from localStorage
    clearUserSession();
    setUserSession(null);
    setCurrentPage('auth');

    console.log('User logged out');
  };

  const handleNavigate = (page: string) => {
    if (!userSession) {
      console.warn('No user session found, redirecting to auth');
      setCurrentPage('auth');
      return;
    }

    if (page === 'admin' && userSession.role === 'admin') {
      setCurrentPage('admin');
    } else if (page === 'user') {
      setCurrentPage('user');
    } else {
      console.warn('Invalid navigation attempt:', page, 'for role:', userSession.role);
    }
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentPage === 'auth' && <AuthPage onLogin={handleLogin} />}
      {currentPage === 'user' && userSession && (
        <AttendanceCamera 
          userRole={userSession.role} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
      )}
      {currentPage === 'admin' && userSession && userSession.role === 'admin' && (
        <AdminDashboard 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default AttendanceApp;
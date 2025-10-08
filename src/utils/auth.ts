import { UserSession } from '../types';

// Dummy credentials for testing
export const DUMMY_CREDENTIALS = {
  user: { email: 'user@demo.com', password: 'user1234' },
  admin: { email: 'admin@demo.com', password: 'admin1234' }
};

// Local Storage Keys
const AUTH_STORAGE_KEY = 'attendance_auth_session';

// Save user session to localStorage
export const saveUserSession = (session: UserSession): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save user session:', error);
  }
};

// Get user session from localStorage
export const getUserSession = (): UserSession | null => {
  try {
    const sessionData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionData) {
      const session: UserSession = JSON.parse(sessionData);
      // Check if session is still valid (optional: add expiration logic here)
      return session;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user session:', error);
    return null;
  }
};

// Clear user session from localStorage
export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear user session:', error);
  }
};

// Validate credentials
export const validateCredentials = (email: string, password: string): 'user' | 'admin' | null => {
  if (email === DUMMY_CREDENTIALS.admin.email && password === DUMMY_CREDENTIALS.admin.password) {
    return 'admin';
  } else if (email === DUMMY_CREDENTIALS.user.email && password === DUMMY_CREDENTIALS.user.password) {
    return 'user';
  }
  return null;
};

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Device metadata utility
export const getDeviceMetadata = (): string => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

  if (userAgent.indexOf('Win') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('iOS') > -1) os = 'iOS';

  return `${browser} / ${os}`;
};
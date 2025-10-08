import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, User, Building, Wifi, Clock, Monitor, Upload, Mail, Lock, Eye, EyeOff, AlertCircle, Users, TrendingUp, LogOut, Home, BarChart3, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

// Types
interface AttendanceRecord {
  id: string;
  department: string;
  location: string;
  ip_address: string;
  timestamp: string;
  image_url: string;
  location_address: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormTouched {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

interface UserInfo {
  user_id: string;
  department: string;
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

// User Session type
interface UserSession {
  role: 'user' | 'admin';
  email: string;
  loginTime: string;
}

// Dummy credentials for testing
const DUMMY_CREDENTIALS = {
  user: { email: 'user@demo.com', password: 'user1234' },
  admin: { email: 'admin@demo.com', password: 'admin1234' }
};

// localStorage helper functions
const AUTH_STORAGE_KEY = 'attendance_auth_session';

const saveUserSession = (session: UserSession): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save user session:', error);
  }
};

const getUserSession = (): UserSession | null => {
  try {
    const sessionData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error('Failed to get user session:', error);
    return null;
  }
};

const clearUserSession = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear user session:', error);
  }
};

// Auth Component
const AuthPage: React.FC<{ onLogin: (role: 'user' | 'admin', email: string) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const validateField = (name: string, value: string): string => {
    let error = '';

    switch (name) {
      case 'name':
        if (!isLogin && !validateName(value)) {
          error = 'Name must be at least 2 characters long';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (!validatePassword(value)) {
          error = 'Password must be at least 8 characters long';
        }
        break;
      case 'confirmPassword':
        if (!isLogin) {
          if (!value) {
            error = 'Please confirm your password';
          } else if (value !== formData.password) {
            error = 'Passwords do not match';
          }
        }
        break;
    }

    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name as keyof FormTouched]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }

    if (name === 'password' && touched.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 'Passwords do not match' : '';
      setErrors({ ...errors, password: validateField(name, value), confirmPassword: confirmError });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = () => {
    const newErrors: FormErrors = {};
    const fieldsToValidate = isLogin 
      ? ['email', 'password'] 
      : ['name', 'email', 'password', 'confirmPassword'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) newErrors[field as keyof FormErrors] = error;
    });

    setErrors(newErrors);
    setTouched(fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {} as FormTouched));

    if (Object.keys(newErrors).length === 0) {
      if (isLogin) {
        // Check dummy credentials
        if (formData.email === DUMMY_CREDENTIALS.admin.email && formData.password === DUMMY_CREDENTIALS.admin.password) {
          onLogin('admin', formData.email);
        } else if (formData.email === DUMMY_CREDENTIALS.user.email && formData.password === DUMMY_CREDENTIALS.user.password) {
          onLogin('user', formData.email);
        } else {
          alert('❌ Invalid credentials! Try:\nUser: user@demo.com / user1234\nAdmin: admin@demo.com / admin1234');
        }
      } else {
        alert('✅ Account created successfully! You can now login.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setErrors({});
        setTouched({});
      }
    } else {
      alert('❌ Please fix the errors in the form');
    }
  };

  const handleModeSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setErrors({});
    setTouched({});
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Demo Credentials Info */}
  <div className="bg-blue-950 rounded-lg p-4 mb-6 text-white text-sm border border-blue-900">
          <h3 className="font-semibold mb-2">🎯 Demo Credentials:</h3>
          <div className="space-y-1">
            <p><strong>User:</strong> user@demo.com / user1234</p>
            <p><strong>Admin:</strong> admin@demo.com / admin1234</p>
          </div>
        </div>

  <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          {/* Slider Toggle */}
          <div className="relative bg-gray-950 p-1 m-4 rounded-xl">
            <div 
              className="absolute top-1 bottom-1 left-1 right-1/2 bg-[#1c398e] rounded-lg transition-transform duration-300 ease-in-out"
              style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <div className="relative grid grid-cols-2 gap-1">
              <button
                onClick={() => handleModeSwitch(true)}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                  isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleModeSwitch(false)}
                className={`py-3 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                  !isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 bg-gray-950 rounded-b-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-400">
                {isLogin ? 'Enter your credentials to access your account' : 'Sign up to get started'}
              </p>
            </div>

            <div className="space-y-5">
              {/* Name Field - Only for Signup */}
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ marginTop: errors.name && touched.name ? '-12px' : '0' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Full Name"
                    className={`w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border ${
                      errors.name && touched.name ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all`}
                  />
                  {errors.name && touched.name && (
                    <div className="flex items-center mt-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ marginTop: errors.email && touched.email ? '-12px' : '0' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email Address"
                  className={`w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all`}
                />
                {errors.email && touched.email && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ marginTop: errors.password && touched.password ? '-12px' : '0' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Password"
                  className={`w-full bg-gray-700 text-white pl-12 pr-12 py-3 rounded-lg border ${
                    errors.password && touched.password ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  style={{ marginTop: errors.password && touched.password ? '-12px' : '0' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && touched.password && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password - Only for Signup */}
              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" style={{ marginTop: errors.confirmPassword && touched.confirmPassword ? '-12px' : '0' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm Password"
                    className={`w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border ${
                      errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all`}
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="flex items-center mt-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me / Forgot Password */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-300 cursor-pointer">
                    <input type="checkbox" className="mr-2 rounded" />
                    Remember me
                  </label>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-[#1c398e] hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            {/* Divider */}
            {/* <div className="mt-6 mb-6 flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div> */}

            {/* Social Login */}
            {/* <div className="space-y-3">
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Attendance Component
const AttendanceCameraUI: React.FC<{ userRole: string; userEmail: string; onNavigate: (page: string) => void; onLogout: () => void }> = ({ userRole, userEmail, onNavigate, onLogout }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    user_id: 'USR' + Math.floor(Math.random() * 10000),
    department: ''
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('Unable to fetch IP'));
      
    // Auto-request location on component mount
    requestLocation();
  }, []);

  // Get user's geolocation
  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('Location obtained:', latitude, longitude);
        
        const location: LocationInfo = {
          latitude,
          longitude,
          accuracy
        };

        // Try to get address from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          location.address = data.city && data.countryName 
            ? `${data.city}, ${data.countryName}` 
            : 'Address not available';
        } catch (error) {
          console.log('Reverse geocoding failed:', error);
          location.address = 'Address lookup failed';
        }
        
        setLocationInfo(location);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Location access denied. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown location error.';
            break;
        }
        
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle video stream setup
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log('Setting up video stream');
      const video = videoRef.current;
      video.srcObject = stream;
      
      // Simple auto-play
      video.play().catch(error => {
        console.log('Auto-play failed:', error);
      });
    }
  }, [stream]);

  const getDeviceMetadata = () => {
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

  // Start camera
  const startCamera = async () => {
    setCameraLoading(true);
    setUploadError(null);
    
    try {
      console.log('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user'
        } 
      });
      
      console.log('Camera access granted');
      setStream(mediaStream);
      
      // Set video source immediately
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video source set');
      }
      
      setUploadSuccess(false);
    } catch (error) {
      console.error('Camera error:', error);
      setUploadError('Camera access denied. Please allow camera permissions.');
    } finally {
      setCameraLoading(false);
    }
  };  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      console.log('Capturing image...');
      
      // Set canvas size to video size
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Image captured and encoded as base64');
        
        // Set the captured image
        setCapturedImage(imageDataUrl);
        
        // Stop the camera stream
        stopCamera();
      } else {
        setUploadError('Failed to capture image');
      }
    } else {
      setUploadError('Camera not ready');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const submitAttendance = async () => {
    console.log('=== ATTENDANCE SUBMISSION DEBUG ===');
    console.log('Captured Image exists:', !!capturedImage);
    console.log('Department selected:', userInfo.department);
    console.log('Location info:', locationInfo);
    console.log('IP Address:', ipAddress);

    if (!capturedImage || !userInfo.department) {
      const errorMsg = 'Please select a department before submitting';
      console.log('ERROR:', errorMsg);
      setUploadError(errorMsg);
      return;
    }

    if (!locationInfo) {
      const errorMsg = 'Location is required. Please allow location access and try again.';
      console.log('ERROR:', errorMsg);
      setUploadError(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Prepare the data in the exact format requested
      const attendanceData = {
        id: userInfo.user_id,
        image_url: capturedImage, // This is already in base64 format
        department: userInfo.department.toLowerCase(),
        location: `${locationInfo.latitude}, ${locationInfo.longitude}`,
        location_address: locationInfo.address,
        timestamp: new Date().toISOString(),
        ip_address: ipAddress
      };

      console.log('=== SUBMITTING DATA ===');
      console.log('Attendance Data:', {
        ...attendanceData,
        image_url: attendanceData.image_url.substring(0, 50) + '...[truncated]'
      });

      // Send to Next.js API route (which forwards to AWS)
      console.log('Making API request to Next.js route:', '/api/attendance');
      
      const response = await axios.post('/api/attendance', attendanceData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);

      if (response.status === 200 || response.status === 201) {
        setUploadSuccess(true);
        console.log("✅ SUCCESS: Attendance submitted successfully!", response.data);
        setCapturedImage(null);
      } else {
        const errorMsg = `Server returned status ${response.status}`;
        console.log('❌ ERROR:', errorMsg);
        setUploadError(errorMsg);
      }
    } catch (error: any) {
      console.log('=== ERROR CAUGHT ===');
      console.error('Full error object:', error);
      
      if (error.response) {
        // Server responded with error status
        console.log('Error Response Status:', error.response.status);
        console.log('Error Response Data:', error.response.data);
        console.log('Error Response Headers:', error.response.headers);
        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error ||
                            `Server error: ${error.response.status}`;
        setUploadError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received:', error.request);
        setUploadError('Network error: No response from server. Please check your internet connection.');
      } else {
        // Something else happened
        console.log('Request setup error:', error.message);
        setUploadError(`Request error: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      console.log('=== SUBMISSION COMPLETE ===');
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation Bar */}
  <nav className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Home className="h-6 w-6 mr-2" style={{ color: '#004e9c' }} />
              <span className="text-lg font-semibold text-gray-900">Attendance System</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {userRole === 'admin' ? `Admin (${userEmail})` : `User (${userEmail})`}</span>
              {userRole === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Dashboard
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            {/* Header */}
            <div className="bg-[#1c398e] px-6 py-8 text-white" style={{ background: 'linear-gradient(135deg, #1c398e 0%, #004e9c 100%)' }}>
              <div className="flex items-center justify-center mb-2">
                <Camera className="h-10 w-10 mr-3" />
                <h1 className="text-3xl font-bold">Take Attendance</h1>
              </div>
              <p className="text-center text-blue-100">Capture your photo to mark your attendance</p>
            </div>

            {/* User Info Form */}
            <div className="p-6 bg-gray-950 border-b border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    User ID
                  </label>
                  <input
                    type="text"
                    value={userInfo.user_id}
                    onChange={(e) => setUserInfo({ ...userInfo, user_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter User ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Department
                  </label>
                  <select
                    value={userInfo.department}
                    onChange={(e) => setUserInfo({ ...userInfo, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              {/* Device Info Display */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center text-gray-400">
                  <Wifi className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                  <span className="font-mono text-xs">{ipAddress || 'Loading...'}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Monitor className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                  <span className="text-xs">{getDeviceMetadata()}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                  <span className="text-xs">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                  <span className="text-xs">
                    {locationLoading ? 'Getting location...' : 
                     locationInfo ? `${locationInfo.latitude.toFixed(4)}, ${locationInfo.longitude.toFixed(4)}` : 
                     'Location required'}
                  </span>
                </div>
              </div>

              {/* Location Info */}
              {locationInfo && (
                <div className="mt-3 p-3 bg-blue-950 border border-blue-900 rounded-lg text-sm">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-blue-300 font-semibold">Location Information</span>
                  </div>
                  <div className="text-gray-300 space-y-1">
                    <p><strong>Address:</strong> {locationInfo.address || 'Resolving...'}</p>
                    <p><strong>Coordinates:</strong> {locationInfo.latitude.toFixed(6)}, {locationInfo.longitude.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ±{Math.round(locationInfo.accuracy)}m</p>
                  </div>
                </div>
              )}

              {/* Location Error */}
              {locationError && (
                <div className="mt-3 p-3 bg-red-950 border border-red-800 rounded-lg text-sm">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-red-400" />
                    <span className="text-red-300 font-semibold">Location Error</span>
                  </div>
                  <p className="text-gray-300">{locationError}</p>
                  <button
                    onClick={requestLocation}
                    className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    Retry Location
                  </button>
                </div>
              )}
            </div>

            {/* Camera/Image Area */}
            <div className="p-6">
              {/* Debug Info */}
              {/* <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                <p><strong>Debug Info:</strong></p>
                <p>Stream: {stream ? '✅ Active' : '❌ None'}</p>
                <p>Video Ref: {videoRef.current ? '✅ Ready' : '❌ Not Ready'}</p>
                <p>Captured Image: {capturedImage ? '✅ Available' : '❌ None'}</p>
                <p>Camera Loading: {cameraLoading ? '⏳ Loading...' : '✅ Ready'}</p>
                <p>Location: {locationInfo ? '✅ Available' : locationLoading ? '⏳ Loading...' : '❌ None'}</p>
                {stream && <p>Stream Tracks: {stream.getTracks().length}</p>}
                {locationInfo && <p>Location Accuracy: ±{Math.round(locationInfo.accuracy)}m</p>}
              </div> */}
              
              <div className="relative bg-gray-950 rounded-xl overflow-hidden border border-gray-800" style={{ aspectRatio: '16/9' }}>
                {!stream && !capturedImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera not started</p>
                      <p className="text-sm text-gray-400 mt-2">Click the button below to begin</p>
                    </div>
                  </div>
                )}

                {stream && !capturedImage && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onCanPlay={() => {
                      console.log('Video is ready to play');
                    }}
                  />
                )}

                {capturedImage && (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="max-w-full max-h-full object-contain"
                      onLoad={() => console.log('Captured image loaded')}
                      onError={() => console.error('Failed to load captured image')}
                    />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {!stream && !capturedImage && (
                  <button
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#004e9c' }}
                  >
                    {cameraLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Starting Camera...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mr-2" />
                        Start Camera
                      </>
                    )}
                  </button>
                )}

                {stream && !capturedImage && (
                  <>
                    <button
                      onClick={captureImage}
                      className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: '#004e9c' }}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                  </>
                )}

                {capturedImage && !uploadSuccess && (
                  <>
                    <button
                      onClick={submitAttendance}
                      disabled={isUploading}
                      className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#10b981' }} // Green color
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Take Attendance
                        </>
                      )}
                    </button>
                    <button
                      onClick={retakePhoto}
                      disabled={isUploading}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Retake Photo
                    </button>
                  </>
                )}

                {uploadSuccess && (
                  <button
                    onClick={() => {
                      setUploadSuccess(false);
                      setUserInfo({ ...userInfo, user_id: 'USR' + Math.floor(Math.random() * 10000) });
                    }}
                    className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: '#004e9c' }}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Take Another
                  </button>
                )}
              </div>
            </div>

            {/* Status Messages */}
            {uploadSuccess && (
              <div className="mx-6 mb-6 p-4 bg-green-950 border border-green-800 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-800 font-semibold">Attendance Submitted Successfully!</p>
                  <p className="text-green-700 text-sm">Your attendance has been recorded.</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mx-6 mb-6 p-4 bg-red-950 border border-red-800 rounded-lg flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-red-800 font-semibold">Error</p>
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard: React.FC<{ userEmail: string; onNavigate: (page: string) => void; onLogout: () => void }> = ({ userEmail, onNavigate, onLogout }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        console.log('Fetching attendance data...');
        
        const response = await axios.get('/api/attendance');
        console.log('API Response:', response.data);
        
        if (response.data.success && response.data.data?.data?.Items) {
          setAttendanceData(response.data.data.data.Items);
        } else {
          setError('No attendance data available');
        }
      } catch (err: any) {
        console.error('Error fetching attendance data:', err);
        setError(err.response?.data?.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const departmentStats = attendanceData.reduce((acc: Record<string, number>, record: AttendanceRecord) => {
    acc[record.department] = (acc[record.department] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(departmentStats).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#004e9c', '#0066cc', '#3399ff', '#66b3ff', '#99ccff'];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const today = new Date().toDateString();
  const todayLogins = attendanceData.filter(
    (record: AttendanceRecord) => new Date(record.timestamp).toDateString() === today
  ).length;

  // Parse location string to get coordinates
  const parseLocation = (location: string) => {
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
    return { latitude: lat, longitude: lng };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-400">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation Bar */}
  <nav className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" style={{ color: '#004e9c' }} />
              <span className="text-lg font-semibold text-gray-900">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, Admin ({userEmail})</span>
              <button
                onClick={() => onNavigate('user')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Camera className="h-4 w-4 mr-1" />
                Take Attendance
              </button>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
  <header className="bg-[#1c398e] shadow-lg" style={{ background: 'linear-gradient(135deg, #1c398e 0%, #004e9c 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Users className="mr-3 h-8 w-8" />
            User Attendance Dashboard
          </h1>
          <p className="text-blue-100 mt-1">Monitor and track user login activity in real-time</p>
        </div>
      </header>

      {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#004e9c' }}>
          <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
          <p className="text-sm font-medium text-gray-400">Today's Logins</p>
          <p className="text-2xl font-bold text-white">{todayLogins}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600">
          <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
          <p className="text-sm font-medium text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-white">{attendanceData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-600">
          <Building className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
          <p className="text-sm font-medium text-gray-400">Departments</p>
          <p className="text-2xl font-bold text-white">{Object.keys(departmentStats).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-600">
          <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
          <p className="text-sm font-medium text-gray-400">On Time Rate</p>
          <p className="text-2xl font-bold text-white">
            {attendanceData.length > 0 
              ? Math.round((attendanceData.filter(r => new Date(r.timestamp).getHours() < 8).length / attendanceData.length) * 100)
              : 0
            }%
          </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Distribution Chart */}
          <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#004e9c' }} />
              Department Distribution
            </h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#004e9c"
              dataKey="value"
              label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151', 
                borderRadius: '8px',
                color: '#ffffff'
              }} 
            />
            <Legend 
              wrapperStyle={{ color: '#ffffff' }}
            />
          </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
              </div>
            )}
          </div>

          {/* Login Activity Timeline */}
          <div className="bg-gray-900 rounded-xl shadow-md p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" style={{ color: '#004e9c' }} />
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {attendanceData.slice(0, 6).map((record, index) => {
          const isOnTime = new Date(record.timestamp).getHours() < 8;
          return (
            <div key={`timeline-${record.id}-${index}`} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isOnTime ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
            {record.id} - {record.department}
                </p>
                <p className="text-xs text-gray-400">
            {formatTimestamp(record.timestamp)}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isOnTime 
            ? 'bg-green-900 text-green-300' 
            : 'bg-red-900 text-red-300'
              }`}>
                {isOnTime ? 'On Time' : 'Late'}
              </span>
            </div>
          );
              })}
              {attendanceData.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
              )}
            </div>
          </div>
        </div>
      {/* </div> */}

        {/* Data Table */}
        <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-950">
            <h2 className="text-xl font-semibold text-gray-800">Recent Login Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Showing most recent user logins</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-950 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {attendanceData.map((record, index) => {
                  const locationCoords = parseLocation(record.location);
                  return (
                    <tr 
                      key={`${record.id}-${index}`} 
                      className="hover:bg-blue-950 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={record.image_url}
                            alt={`User ${record.id}`}
                            className="h-10 w-10 rounded border-2 object-cover"
                            style={{ borderColor: '#004e9c' }}
                            // onError={(e) => {
                            //   (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70);
                            // }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-400">{record.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-mono text-white rounded-full px-2 py-1 ${
                          new Date(record.timestamp).getHours() >= 8 ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {new Date(record.timestamp).getHours() >= 8 ? 'Late' : 'On Time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white capitalize"
                          style={{ backgroundColor: '#004e9c' }}
                        >
                          {record.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-300">{record.location_address}</div>
                            <div className="text-xs text-gray-500 font-mono">
                              {locationCoords.latitude?.toFixed(4)}, {locationCoords.longitude?.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <Wifi className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                          <span className="max-w-xs truncate font-mono">{record.ip_address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                          {formatTimestamp(record.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-950">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing <span className="font-semibold text-gray-200">{attendanceData.length}</span> entries
              </p>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#004e9c' }}
                >
                  Previous
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#004e9c' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
const AttendanceApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'auth' | 'user' | 'admin'>('auth');
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const existingSession = getUserSession();
        if (existingSession) {
          console.log('Found existing session:', existingSession);
          setUserRole(existingSession.role);
          setUserEmail(existingSession.email);
          setCurrentPage(existingSession.role === 'admin' ? 'admin' : 'user');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
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
    setUserRole(role);
    setUserEmail(email);
    setCurrentPage(role === 'admin' ? 'admin' : 'user');

    console.log('User logged in:', session);
  };

  const handleLogout = () => {
    // Clear session from localStorage
    clearUserSession();
    setUserRole(null);
    setUserEmail('');
    setCurrentPage('auth');

    console.log('User logged out');
  };

  const handleNavigate = (page: string) => {
    if (!userRole) {
      console.warn('No user session found, redirecting to auth');
      setCurrentPage('auth');
      return;
    }

    if (page === 'admin' && userRole === 'admin') {
      setCurrentPage('admin');
    } else if (page === 'user') {
      setCurrentPage('user');
    } else {
      console.warn('Invalid navigation attempt:', page, 'for role:', userRole);
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
      {currentPage === 'user' && userRole && (
        <AttendanceCameraUI 
          userRole={userRole} 
          userEmail={userEmail}
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
      )}
      {currentPage === 'admin' && userRole === 'admin' && (
        <AdminDashboard 
          userEmail={userEmail}
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
};

export default AttendanceApp;
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

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

export default function AuthPage() {
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

    // Validate on change if field was touched
    if (touched[name as keyof FormTouched]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }

    // Also revalidate confirmPassword if password changes
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
    // Validate all fields
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

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      if (isLogin) {
        console.log('Login attempt:', { email: formData.email, password: formData.password });
        alert('✅ Login successful! Check console for details.');
      } else {
        console.log('Signup attempt:', formData);
        alert('✅ Account created successfully! Check console for details.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Slider Toggle */}
          <div className="relative bg-gray-900 p-1 m-4 rounded-xl">
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
          <div className="p-8">
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
            <div className="mt-6 mb-6 flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
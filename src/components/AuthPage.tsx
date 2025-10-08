import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FormData, FormErrors, FormTouched } from '../types';
import { 
  DUMMY_CREDENTIALS, 
  validateCredentials, 
  validateEmail, 
  validatePassword, 
  validateName 
} from '../utils/auth';

interface AuthPageProps {
  onLogin: (role: 'user' | 'admin', email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
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
        const role = validateCredentials(formData.email, formData.password);
        if (role) {
          onLogin(role, formData.email);
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
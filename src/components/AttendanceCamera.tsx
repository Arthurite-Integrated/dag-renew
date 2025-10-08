import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, User, Building, Wifi, Clock, MapPin, LogOut, Home, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { UserInfo, LocationInfo, NavigationProps } from '../types';
import { getDeviceMetadata } from '../utils/auth';

interface AttendanceCameraProps extends NavigationProps {
  userRole: string;
}

const AttendanceCamera: React.FC<AttendanceCameraProps> = ({ userRole, onNavigate, onLogout }) => {
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
  };

  const stopCamera = () => {
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
              <span className="text-sm text-gray-500">Welcome, {userRole === 'admin' ? 'Admin' : 'Spectra'}</span>
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

export default AttendanceCamera;
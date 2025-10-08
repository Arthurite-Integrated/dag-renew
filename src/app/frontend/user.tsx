import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, User, Building, Wifi, Clock, Monitor, Upload, MapPin } from 'lucide-react';
import axios from 'axios';

const AttendanceCameraUI = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    user_id: 'USR' + Math.floor(Math.random() * 10000),
    department: ''
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get user's IP address (simulated - in real app, backend should capture this)
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    // Fetch IP address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('Unable to fetch IP'));
      
    // Get user location
    requestLocation();
  }, []);

  // Get user's geolocation
  const requestLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setUploadError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location obtained:', latitude, longitude);
        
        try {
          // Try to get address from coordinates
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const address = data.city && data.countryName 
            ? `${data.city}, ${data.countryName}` 
            : 'Address not available';
            
          setLocationInfo({ latitude, longitude, address });
        } catch (error) {
          console.log('Reverse geocoding failed:', error);
          setLocationInfo({ latitude, longitude, address: 'Address lookup failed' });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setUploadError('Location access denied. Please allow location permissions.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Get device metadata
  const getDeviceMetadata = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

    // Detect OS
    if (userAgent.indexOf('Win') > -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
    else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
    else if (userAgent.indexOf('Android') > -1) os = 'Android';
    else if (userAgent.indexOf('iOS') > -1) os = 'iOS';

    return `${browser} / ${os}`;
  };

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUploadSuccess(false);
      setUploadError(null);
    } catch (error) {
      setUploadError('Camera access denied. Please allow camera permissions.');
      console.error('Error accessing camera:', error);
    }
  };

  // Stop camera
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
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Convert data URL to Blob
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Submit attendance
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
        location_Address: locationInfo.address,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8 text-white" style={{ background: 'linear-gradient(135deg, #004e9c 0%, #0066cc 100%)' }}>
            <div className="flex items-center justify-center mb-2">
              <Camera className="h-10 w-10 mr-3" />
              <h1 className="text-3xl font-bold">Take Attendance</h1>
            </div>
            <p className="text-center text-blue-100">Capture your photo to mark your attendance</p>
          </div>

          {/* User Info Form */}
          <div className="p-6 bg-gray-50 border-b">
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
                  className="w-full px-4 py-2 border border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="" className="dark:bg-gray-800 text-black">Select Department</option>
                  <option value="Engineering" className="dark:bg-gray-800 dark:text-black">Engineering</option>
                  <option value="Marketing" className="dark:bg-gray-800 dark:text-white">Marketing</option>
                  <option value="Sales" className="dark:bg-gray-800 dark:text-white">Sales</option>
                  <option value="HR" className="dark:bg-gray-800 dark:text-white">HR</option>
                  <option value="Finance" className="dark:bg-gray-800 dark:text-white">Finance</option>
                </select>
              </div>
            </div>

            {/* Device Info Display */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Wifi className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                <span className="font-mono text-xs">{ipAddress || 'Loading...'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Monitor className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                <span className="text-xs">{getDeviceMetadata()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                <span className="text-xs">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
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
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-blue-800 font-semibold">Location Information</span>
                </div>
                <div className="text-gray-700 space-y-1">
                  <p><strong>Address:</strong> {locationInfo.address}</p>
                  <p><strong>Coordinates:</strong> {locationInfo.latitude.toFixed(6)}, {locationInfo.longitude.toFixed(6)}</p>
                </div>
              </div>
            )}

            {/* Location Error */}
            {!locationInfo && !locationLoading && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-red-600" />
                  <span className="text-red-800 font-semibold">Location Required</span>
                </div>
                <p className="text-gray-700">Please allow location access to submit attendance.</p>
                <button
                  onClick={requestLocation}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                >
                  Enable Location
                </button>
              </div>
            )}
          </div>

          {/* Camera/Image Area */}
          <div className="p-6">
            <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
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
                  className="w-full h-full object-cover"
                />
              )}

              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {!stream && !capturedImage && (
                <button
                  onClick={startCamera}
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: '#004e9c' }}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera
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
                    style={{ backgroundColor: '#004e9c' }}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Submit Attendance
                      </>
                    )}
                  </button>
                  <button
                    onClick={retakePhoto}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Retake
                  </button>
                </>
              )}

              {/* Debug: Test API without validations */}
              {capturedImage && (
                <button
                  onClick={async () => {
                    console.log('=== TESTING API CONNECTION ===');
                    try {
                      const testData = {
                        id: "TEST_USER",
                        image_url: capturedImage.substring(0, 100) + "...",
                        department: "engineering",
                        location: "6.5244, 3.3792",
                        location_Address: "Lagos, Nigeria",
                        timestamp: new Date().toISOString(),
                        ip_address: ipAddress || "127.0.0.1"
                      };
                      
                      console.log('Test data:', testData);
                      
                      const response = await axios.post('/api/attendance', testData, {
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                      });
                      
                      console.log('✅ Test successful:', response.data);
                      alert('API test successful! Check console for details.');
                    } catch (error: any) {
                      console.error('❌ Test failed:', error);
                      alert(`API test failed: ${error.message}`);
                    }
                  }}
                  className="w-full mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  🔧 Test API Connection
                </button>
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
            <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-green-800 font-semibold">Attendance Submitted Successfully!</p>
                <p className="text-green-700 text-sm">Your attendance has been recorded.</p>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
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
  );
};

export default AttendanceCameraUI;
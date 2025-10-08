import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Users, LogOut, BarChart3, MapPin, Wifi, Clock } from 'lucide-react';
import axios from 'axios';
import { AttendanceRecord, NavigationProps } from '../types';

const AdminDashboard: React.FC<NavigationProps> = ({ onNavigate, onLogout }) => {
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
              <span className="text-sm text-gray-500">Welcome, Admin</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Attendance</p>
                <p className="text-2xl font-semibold text-white">{attendanceData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-600">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Today's Logins</p>
                <p className="text-2xl font-semibold text-white">{todayLogins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-600">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Departments</p>
                <p className="text-2xl font-semibold text-white">{Object.keys(departmentStats).length}</p>
              </div>
            </div>
          </div>
        </div>

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
                            className="h-10 w-10 rounded-full border-2 object-cover"
                            style={{ borderColor: '#004e9c' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70);
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-400">{record.id}</span>
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

export default AdminDashboard;
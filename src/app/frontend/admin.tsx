import React, { useState } from 'react';
import { Users, TrendingUp, Clock, Monitor } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Mock data
const mockAttendanceData = [
  {
    user_id: 'USR001',
    name: 'John Doe',
    department: 'Engineering',
    ip_address: '192.168.1.100',
    image_url: 'https://i.pravatar.cc/150?img=12',
    device_metadata: 'Chrome 120.0 / Windows 10',
    timestamp: '2025-10-06T09:15:23Z'
  },
  {
    user_id: 'USR002',
    name: 'Sarah Johnson',
    department: 'Marketing',
    ip_address: '192.168.1.101',
    image_url: 'https://i.pravatar.cc/150?img=5',
    device_metadata: 'Safari 17.2 / macOS 14',
    timestamp: '2025-10-06T09:12:45Z'
  },
  {
    user_id: 'USR003',
    name: 'Mike Chen',
    department: 'Engineering',
    ip_address: '192.168.1.102',
    image_url: 'https://i.pravatar.cc/150?img=33',
    device_metadata: 'Firefox 121.0 / Ubuntu 22.04',
    timestamp: '2025-10-06T09:08:12Z'
  },
  {
    user_id: 'USR004',
    name: 'Emily Davis',
    department: 'Sales',
    ip_address: '192.168.1.103',
    image_url: 'https://i.pravatar.cc/150?img=9',
    device_metadata: 'Chrome 120.0 / Android 13',
    timestamp: '2025-10-06T09:05:30Z'
  },
  {
    user_id: 'USR005',
    name: 'James Wilson',
    department: 'HR',
    ip_address: '192.168.1.104',
    image_url: 'https://i.pravatar.cc/150?img=52',
    device_metadata: 'Edge 120.0 / Windows 11',
    timestamp: '2025-10-06T08:58:17Z'
  },
  {
    user_id: 'USR006',
    name: 'Lisa Anderson',
    department: 'Engineering',
    ip_address: '192.168.1.105',
    image_url: 'https://i.pravatar.cc/150?img=20',
    device_metadata: 'Chrome 120.0 / macOS 14',
    timestamp: '2025-10-06T08:52:44Z'
  },
  {
    user_id: 'USR007',
    name: 'Robert Taylor',
    department: 'Marketing',
    ip_address: '192.168.1.106',
    image_url: 'https://i.pravatar.cc/150?img=15',
    device_metadata: 'Safari 17.2 / iOS 17',
    timestamp: '2025-10-06T08:45:22Z'
  },
  {
    user_id: 'USR008',
    name: 'Amanda Martinez',
    department: 'Sales',
    ip_address: '192.168.1.107',
    image_url: 'https://i.pravatar.cc/150?img=47',
    device_metadata: 'Chrome 120.0 / Windows 10',
    timestamp: '2025-10-06T08:42:18Z'
  },
  {
    user_id: 'USR009',
    name: 'David Brown',
    department: 'Engineering',
    ip_address: '192.168.1.108',
    image_url: 'https://i.pravatar.cc/150?img=68',
    device_metadata: 'Firefox 121.0 / Linux Mint',
    timestamp: '2025-10-06T08:38:55Z'
  },
  {
    user_id: 'USR010',
    name: 'Jennifer Lee',
    department: 'HR',
    ip_address: '192.168.1.109',
    image_url: 'https://i.pravatar.cc/150?img=32',
    device_metadata: 'Edge 120.0 / Windows 11',
    timestamp: '2025-10-06T08:35:10Z'
  }
];

const AdminDashboard = () => {
  const [attendanceData] = useState(mockAttendanceData);

  // Calculate department statistics
  const departmentStats = attendanceData.reduce((acc: Record<string, number>, record) => {
    acc[record.department] = (acc[record.department] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(departmentStats).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#004e9c', '#0066cc', '#3399ff', '#66b3ff', '#99ccff'];

  // Format timestamp
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

  // Get today's date for comparison
  const today = new Date().toDateString();
  const todayLogins = attendanceData.filter(
    record => new Date(record.timestamp).toDateString() === today
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg" style={{ background: 'linear-gradient(135deg, #004e9c 0%, #0066cc 100%)' }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Total Logins Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: '#004e9c' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Logins Today</p>
                <h3 className="text-4xl font-bold mt-2" style={{ color: '#004e9c' }}>{todayLogins}</h3>
                <div className="flex items-center mt-3 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">+12% from yesterday</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-full">
                <Clock className="h-10 w-10" style={{ color: '#004e9c' }} />
              </div>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Logins by Department</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => {
                    const total = pieData.reduce((sum, entry) => sum + entry.value, 0);
                    const percent = ((value / total) * 100).toFixed(0);
                    return `${name}: ${percent}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
            <h2 className="text-xl font-semibold text-gray-800">Recent Login Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Showing most recent user logins</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr 
                    key={record.user_id} 
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={record.image_url}
                          alt={record.name}
                          className="h-10 w-10 rounded-full border-2"
                          style={{ borderColor: '#004e9c' }}
                        />
                        <span className="ml-3 font-medium text-gray-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">{record.user_id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                        style={{ backgroundColor: '#004e9c' }}
                      >
                        {record.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">{record.ip_address}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Monitor className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                        <span className="max-w-xs truncate">{record.device_metadata}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" style={{ color: '#004e9c' }} />
                        {formatTimestamp(record.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{attendanceData.length}</span> entries
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
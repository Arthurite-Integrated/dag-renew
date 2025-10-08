import axios from 'axios';

const attendanceData = {
  id: 'USR1234',
  image_url: 'data:image/jpeg;base64,...',
  department: 'engineering',
  location: '37.7749,-122.4194',
  location_ddress: 'San Francisco, CA',
  timestamp: new Date().toISOString(),
  ip_address: '192.168.1.1'
};

const response = await axios.get(
        'https://0p3ep5f22f.execute-api.us-east-1.amazonaws.com/dev/',
        // attendanceData,
        // {
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   timeout: 30000, // 30 second timeout
        // }
      );
console.log(response.data.data.Items)
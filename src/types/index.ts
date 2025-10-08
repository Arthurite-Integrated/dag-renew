// Attendance Record from API
export interface AttendanceRecord {
  id: string;
  department: string;
  location: string;
  ip_address: string;
  timestamp: string;
  image_url: string;
  location_address: string;
}

// Form Data for Authentication
export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface FormTouched {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

// User Info for Attendance
export interface UserInfo {
  user_id: string;
  department: string;
}

// Location Info for Geolocation
export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

// User Session
export interface UserSession {
  role: 'user' | 'admin';
  email: string;
  loginTime: string;
}

// Navigation Props
export interface NavigationProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}
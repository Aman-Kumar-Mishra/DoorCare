import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // We'll configure backendUrl from env or default to 4000
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'Patient'); // Patient, Doctor, Admin
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['token'] = token;
      // also set withCredentials if utilizing cookies too
      axios.defaults.withCredentials = true;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    } else {
      delete axios.defaults.headers.common['token'];
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  }, [token, role]);

  const logout = () => {
    setToken('');
    setRole('Patient');
    setUserData(null);
    toast.info("Logged out successfully");
  };

  return (
    <AppContext.Provider value={{ token, setToken, role, setRole, userData, setUserData, backendUrl, logout }}>
      {children}
    </AppContext.Provider>
  );
};

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider, AppContext } from './context/AppContext';
import { useContext } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AppContext);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Main App Layout
const AppLayout = () => {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 72px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}

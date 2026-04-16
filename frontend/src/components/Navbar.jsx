import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { DoorOpen } from 'lucide-react';

export default function Navbar() {
  const { token, role, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      background: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <DoorOpen color="var(--primary)" size={32} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-gradient">DoorCare</h1>
      </div>
      
      {token ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Role: <span style={{ color: 'var(--primary)' }}>{role}</span></span>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </div>
      ) : location.pathname !== '/login' ? (
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Login / Register</button>
      ) : null}
    </nav>
  );
}

import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Login() {
  const { token, setToken, role, setRole, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Patient'); // Patient, Doctor, Admin
  const [isLogin, setIsLogin] = useState(true); // Login vs Register

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Doctor-specific advanced form states
  const [docData, setDocData] = useState({
    speciality: 'General physician',
    qualification: '',
    experience: '1 Year',
    fee: '',
    about: '',
    address: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (token) {
      if(role === 'Patient') navigate('/');
      else navigate('/dashboard');
    }
  }, [token, navigate, role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleDocChange = (e) => {
    setDocData({ ...docData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let path = '';
    
    if (activeTab === 'Patient') {
      path = isLogin ? '/api/auth/login-patient' : '/api/auth/register-patient';
    } else if (activeTab === 'Doctor') {
      path = isLogin ? '/api/auth/login-doctor' : '/api/auth/register-doctor';
    } else if (activeTab === 'Admin') {
      path = '/api/auth/login-admin';
    }

    try {
      let payload;
      let headers = { 'Content-Type': 'application/json' };

      // If Doctor Registration, build a FormData boundary payload
      if (!isLogin && activeTab === 'Doctor') {
        if (!image) return toast.warn("A profile photo is mandatory for Doctor Registration!");
        
        payload = new FormData();
        payload.append('name', formData.name);
        payload.append('email', formData.email);
        payload.append('password', formData.password);
        payload.append('speciality', docData.speciality);
        payload.append('qualification', docData.qualification);
        payload.append('experience', docData.experience);
        payload.append('fee', docData.fee);
        payload.append('about', docData.about);
        payload.append('address', JSON.stringify({ line1: docData.address, line2: '' }));
        payload.append('image', image);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = formData; // Standard JSON payload
      }

      const { data } = await axios.post(`${backendUrl}${path}`, payload, { headers });
      
      if (data.success) {
        if (data.token) {
          setRole(activeTab);
          setToken(data.token);
          toast.success(`Welcome back, ${activeTab}!`);
        } else {
          // It was a registration
          toast.success(data.message || "Success! Please log in.");
          setIsLogin(true);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '80vh', padding: '2rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: (!isLogin && activeTab === 'Doctor') ? '700px' : '420px', transition: 'all 0.3s ease' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>DoorCare Portal</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Welcome! Please select your role to continue.
        </p>

        {/* Role Toggles */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: 'var(--radius-lg)' }}>
          {['Patient', 'Doctor', 'Admin'].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => { setActiveTab(r); setIsLogin(true); }}
              style={{
                flex: 1,
                padding: '0.5rem 0',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: activeTab === r ? 'white' : 'transparent',
                boxShadow: activeTab === r ? 'var(--shadow-sm)' : 'none',
                color: activeTab === r ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === r ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          
          <div style={{ display: (!isLogin && activeTab === 'Doctor') ? 'grid' : 'block', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Core Info Column */}
            <div>
              {!isLogin && (activeTab === 'Patient' || activeTab === 'Doctor') && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Dr. John Doe" required />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="you@example.com" required />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="••••••••" minLength={8} required />
              </div>
            </div>

            {/* Doctor Extended Info Column */}
            {!isLogin && activeTab === 'Doctor' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Speciality</label>
                  <select name="speciality" value={docData.speciality} onChange={handleDocChange} className="form-input" required>
                     <option value="General physician">General physician</option>
                     <option value="Gynecologist">Gynecologist</option>
                     <option value="Dermatologist">Dermatologist</option>
                     <option value="Pediatricians">Pediatricians</option>
                     <option value="Neurologist">Neurologist</option>
                     <option value="Gastroenterologist">Gastroenterologist</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Consultation Fee</label>
                    <input type="number" name="fee" value={docData.fee} onChange={handleDocChange} className="form-input" placeholder="₹" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Experience</label>
                    <select name="experience" value={docData.experience} onChange={handleDocChange} className="form-input" required>
                       {['1 Year', '2 Years', '3 Years', '5+ Years', '10+ Years'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Qualifications</label>
                  <input type="text" name="qualification" value={docData.qualification} onChange={handleDocChange} className="form-input" placeholder="MBBS, MD" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinic Address</label>
                  <input type="text" name="address" value={docData.address} onChange={handleDocChange} className="form-input" placeholder="123 Medical Block" required />
                </div>
              </div>
            )}
            
            {/* Full Width Elements for Doctor */}
            {!isLogin && activeTab === 'Doctor' && (
               <div style={{ gridColumn: 'span 2' }}>
                 <div className="form-group">
                   <label className="form-label">About You</label>
                   <textarea name="about" value={docData.about} onChange={handleDocChange} className="form-input" placeholder="A brief description about your expertise..." rows="3" required></textarea>
                 </div>
                 
                 <div className="form-group">
                   <label className="form-label">Profile Photo</label>
                   <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="form-input" required style={{ padding: '0.5rem' }} />
                 </div>
               </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? `Login as ${activeTab}` : `Register as ${activeTab}`}
          </button>
        </form>

        {/* Toggle Login/Sign-up Mode (For Patient and Doctor only) */}
        {(activeTab === 'Patient' || activeTab === 'Doctor') && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Home() {
    const navigate = useNavigate();
    const { token } = useContext(AppContext);

    return (
        <div className="container" style={{ minHeight: '80vh', padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden', padding: 0, width: '100%', maxWidth: '1100px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ flex: '1 1 500px', padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1 }}>The future of healthcare, delivered.</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Experience a premium, seamlessly integrated medical gateway. Connect directly with elite specialists, manage your health journey, and unlock modern state-of-the-art care at your fingertips.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {token ? (
                            <button className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.125rem' }} onClick={() => navigate('/dashboard')}>
                                Enter Dashboard
                            </button>
                        ) : (
                            <button className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.125rem' }} onClick={() => navigate('/login')}>
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
                <div style={{ flex: '1 1 400px', position: 'relative', minHeight: '400px' }}>
                    {/* The generated AI image rendered fully covering the side section */}
                    <img src="/hero_image.png" alt="Premium Healthcare Abstraction" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                </div>
            </div>
            
            {/* Features Row */}
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '4rem', width: '100%', maxWidth: '1100px', animationDelay: '0.2s' }}>
                 <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center' }}>
                     <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>In-Home & Virtual Visits</h3>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Effortlessly book professional physicians for secure home visits or rapid online appointments.</p>
                 </div>
                 <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center' }}>
                     <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Premium Health Access</h3>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gain direct, priority access to industry-leading, certified healthcare experts.</p>
                 </div>
                 <div className="glass-panel hover-lift" style={{ padding: '2rem', textAlign: 'center' }}>
                     <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Modern Convenience</h3>
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the modern healthcare trend that makes managing your health radically simple and secure.</p>
                 </div>
            </div>

            {/* Global Footer */}
            <footer className="glass-panel animate-fade-in" style={{ marginTop: '4rem', width: '100%', maxWidth: '1100px', padding: '4rem 2rem 2rem 2rem', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-lg)', animationDelay: '0.4s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', margin: '0 auto', textAlign: 'left' }}>
                    
                    {/* About Us Section */}
                    <div>
                        <h4 style={{ color: 'var(--text-dark)', marginBottom: '1rem', fontSize: '1.25rem' }}>About DoorCare</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                           DoorCare is redefining modern healthcare by blending seamless digital scheduling with premium medical expertise. We bridge the gap between patients and top-tier physicians, offering robust, secure online and on-demand in-home visits.
                        </p>
                    </div>

                    {/* Contact Details Section */}
                    <div>
                        <h4 style={{ color: 'var(--text-dark)', marginBottom: '1rem', fontSize: '1.25rem' }}>Contact Us</h4>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                           <p><strong>Email:</strong> support@doorcare.com</p>
                           <p><strong>Phone:</strong> +91-1234567890</p>
                           <p><strong>Headquarters:</strong> Jaipur National University, Jaipur, India</p>
                        </div>
                    </div>

                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '3rem', paddingTop: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&copy; 2026 DoorCare. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

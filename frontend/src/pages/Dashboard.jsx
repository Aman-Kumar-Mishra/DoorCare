import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, Calendar, Activity, UserCircle, DollarSign, Mail } from 'lucide-react';

export default function Dashboard() {
  const { token, role, backendUrl } = useContext(AppContext);
  
  // Data States
  const [doctors, setDoctors] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  
  // UI States
  const [showAppointments, setShowAppointments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  
  const [metrics, setMetrics] = useState({
    appointments: 0,
    history: 0,
    patients: 0,
    doctors: 0,
    earnings: 0
  });

  // Booking Modal States
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [paymentMode, setPaymentMode] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const generateDates = () => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        dates.push(`${day}_${month}_${year}`);
    }
    return dates;
  };
  const next7Days = generateDates();
  const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"];

  useEffect(() => {
    if (!token) return;
    if (role === 'Patient') fetchPatientData();
    else if (role === 'Admin') fetchAdminData();
    else if (role === 'Doctor') fetchDoctorData();
    else setLoading(false);
  }, [role, token]);

  const extractDynamicAppointments = (apps) => {
        const pending = apps.filter(a => !a.isCompleted && !a.cancelled).length;
        const history = apps.filter(a => a.isCompleted || a.cancelled).length;
        return { pending, history };
  }

  const fetchPatientData = async () => {
    try {
      const docRes = await axios.get(`${backendUrl}/api/patient/all-doctors`);
      if (docRes.data.success) setDoctors(docRes.data.doctors);

      const apptRes = await axios.get(`${backendUrl}/api/patient/view-patient-appointments`);
      if (apptRes.data.success) {
        setAppointmentsList(apptRes.data.appointments);
        const dynamicCounts = extractDynamicAppointments(apptRes.data.appointments);
        setMetrics(prev => ({ ...prev, appointments: dynamicCounts.pending, history: dynamicCounts.history }));
      }
    } catch (error) {
      toast.error('Failed to load patient dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorData = async () => {
    try {
      const statsRes = await axios.get(`${backendUrl}/api/doctor/dashboard`);
      let statEarn = 0, statPat = 0;
      if (statsRes.data.success) {
          statEarn = statsRes.data.dashData.earnings || 0;
          statPat = statsRes.data.dashData.patients || 0;
      }

      const apptRes = await axios.get(`${backendUrl}/api/doctor/view-doctor-appointments`);
      if (apptRes.data.success) {
        setAppointmentsList(apptRes.data.appointments);
        const dynamicCounts = extractDynamicAppointments(apptRes.data.appointments);
        setMetrics(prev => ({
          ...prev,
          appointments: dynamicCounts.pending,
          history: dynamicCounts.history,
          patients: statPat,
          earnings: statEarn
        }));
      }
    } catch (error) {
      toast.error('Failed to load doctor dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get(`${backendUrl}/api/admin/dashboard`);
      let statDoc = 0, statPat = 0, statEarn = 0;
      if (statsRes.data.success) {
          statDoc = statsRes.data.dashData.doctors || 0;
          statPat = statsRes.data.dashData.patients || 0;
          statEarn = statsRes.data.dashData.earnings || 0;
      }
      
      const docRes = await axios.get(`${backendUrl}/api/admin/all-doctors`);
      if (docRes.data.success) setDoctors(docRes.data.doctors);

      const apptRes = await axios.get(`${backendUrl}/api/admin/view-appointments`);
      if (apptRes.data.success) {
         setAppointmentsList(apptRes.data.appointments);
         const dynamicCounts = extractDynamicAppointments(apptRes.data.appointments);
         setMetrics({
           appointments: dynamicCounts.pending,
           history: dynamicCounts.history,
           doctors: statDoc,
           patients: statPat,
           earnings: statEarn
         });
      }

      const patRes = await axios.get(`${backendUrl}/api/admin/all-patients`);
      if (patRes.data.success) setPatientsList(patRes.data.patients);
    } catch (error) {
      toast.error('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = (e) => {
     e.preventDefault();
     if (!slotDate || !slotTime) return toast.warn("Please select a date and time slot.");
     setPaymentMode(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/patient/book-appointment`, { docId: selectedDoc._id, slotDate, slotTime, payment: true });
      if (data.success) {
        toast.success("Payment successful! Appointment locked in.");
        setSelectedDoc(null); setSlotDate(""); setSlotTime(""); setPaymentMode(false);
        setShowAppointments(true); setShowHistory(false); setShowPatients(false);
        fetchPatientData(); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error booking appointment.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
     try {
       const { data } = await axios.post(`${backendUrl}/api/doctor/complete-appointment`, { appointmentId });
       if (data.success) {
          toast.success("Appointment marked as completed.");
          fetchDoctorData();
       }
     } catch(e) { toast.error("Error completing appointment.") }
  };

  const handleUpdateDoctorStatus = async (doctorId, status) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/update-doctor-status`, { doctorId, status });
      if (data.success) {
        toast.success(data.message);
        fetchAdminData();
      } else {
        toast.error(data.message);
      }
    } catch (e) { toast.error("Error updating doctor status.") }
  };

  const getAvailableTimes = () => {
    if (!selectedDoc || !slotDate) return timeSlots;
    const booked = selectedDoc.slots_booked?.[slotDate] || [];
    return timeSlots.filter(t => !booked.includes(t));
  };
  const availableTimes = getAvailableTimes();

  const specialitiesList = ["All", ...new Set(doctors.map(d => d.speciality))];
  const filteredDoctors = activeFilter === "All" ? doctors : doctors.filter(d => d.speciality === activeFilter);

  const calculateAge = (dob) => {
     if (!dob || dob === 'Not Selected') return 'N/A';
     const today = new Date();
     const birthDate = new Date(dob);
     if (isNaN(birthDate)) return 'N/A';
     let age = today.getFullYear() - birthDate.getFullYear();
     const m = today.getMonth() - birthDate.getMonth();
     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
     return age;
  };

  const displayAppointments = showAppointments 
    ? appointmentsList.filter(a => !a.isCompleted && !a.cancelled)
    : (showHistory ? appointmentsList.filter(a => a.isCompleted || a.cancelled) : []);

  return (
    <div className="container" style={{ padding: '2rem 0', position: 'relative' }}>
      
      {/* Booking & Fake Payment Modal */}
      {selectedDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form className="glass-panel animate-fade-in" onSubmit={paymentMode ? handleBookAppointment : handleProceedToPayment} style={{ padding: '2.5rem', width: '90%', maxWidth: '420px', background: 'white' }}>
            {!paymentMode ? (
              <>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Book with {selectedDoc.name}</h3>
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <select className="form-input" value={slotDate} onChange={(e) => { setSlotDate(e.target.value); setSlotTime(""); }} required>
                    <option value="" disabled>Choose a day...</option>
                    {next7Days.map(d => <option key={d} value={d}>{d.split('_').join('/')}</option>)}
                  </select>
                </div>
                {slotDate && (
                  <div className="form-group">
                    <label className="form-label">Select Time Slot</label>
                    <select className="form-input" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} required>
                      <option value="" disabled>Choose a time...</option>
                      {availableTimes.length > 0 ? (
                         availableTimes.map(t => <option key={t} value={t}>{t}</option>)
                      ) : <option value="" disabled>No slots available on this day</option>}
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => { setSelectedDoc(null); setPaymentMode(false); }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={!slotDate || !slotTime}>Proceed</button>
                </div>
              </>
            ) : (
              <>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Secure Payment Checkout</h3>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                   Consultation Fee to Pay: <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>₹{selectedDoc.fee || 0}</span>
                 </p>
                 
                 <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Card Number</label>
                      <input type="text" className="form-input" style={{ fontFamily: 'monospace' }} defaultValue="4242 4242 4242 4242" required />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                       <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                         <label className="form-label" style={{ fontSize: '0.8rem' }}>Expiry</label>
                         <input type="text" className="form-input" defaultValue="12/28" placeholder="MM/YY" required />
                       </div>
                       <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                         <label className="form-label" style={{ fontSize: '0.8rem' }}>CVV</label>
                         <input type="text" className="form-input" defaultValue="123" placeholder="123" required />
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setPaymentMode(false)}>Back</button>
                    <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={bookingLoading}>
                      {bookingLoading ? 'Processing...' : `Pay ₹${selectedDoc.fee || 0} & Book`}
                    </button>
                 </div>
              </>
            )}
          </form>
        </div>
      )}

      <h2 style={{ marginBottom: '2rem' }} className="animate-fade-in">Dashboard Overview</h2>
      
      {/* Universal Shared Metrics Row */}
      <div className="animate-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem', animationDelay: '0.1s' }}>
        
        {/* Universal Metric: Pending Appointments */}
        <div className="glass-panel hover-lift" 
             onClick={() => { setShowAppointments(!showAppointments); setShowPatients(false); setShowHistory(false); }}
             style={{ flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: showAppointments ? '2px solid var(--primary)' : '1px solid transparent' }}>
          <div style={{ background: `var(--primary)20`, padding: '1rem', borderRadius: '50%' }}>
            <Calendar color="var(--primary)" size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Pending Encounters</p>
            <h3 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-dark)' }}>{metrics.appointments}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{showAppointments ? 'Hide List' : 'Click to View Upcoming Data'}</p>
          </div>
        </div>

        {/* Universal Metric: History & Payments */}
        <div className="glass-panel hover-lift" 
             onClick={() => { setShowHistory(!showHistory); setShowAppointments(false); setShowPatients(false); }}
             style={{ flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: showHistory ? '2px solid var(--secondary)' : '1px solid transparent' }}>
          <div style={{ background: `var(--secondary)20`, padding: '1rem', borderRadius: '50%' }}>
            <Activity color="var(--secondary)" size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>History & Payments</p>
            <h3 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-dark)' }}>{metrics.history}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>{showHistory ? 'Hide History' : 'Click to View Past Records'}</p>
          </div>
        </div>

        {/* Admin/Doctor Optional Extensions Metrics */}
        {(role === 'Doctor' || role === 'Admin') && (
           <div className="glass-panel hover-lift" 
                onClick={role === 'Admin' ? () => { setShowPatients(!showPatients); setShowAppointments(false); setShowHistory(false); } : undefined}
                style={{ flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: role === 'Admin' ? 'pointer' : 'default', border: showPatients ? '2px solid var(--accent)' : '1px solid transparent' }}>
             <div style={{ background: `var(--accent)20`, padding: '1rem', borderRadius: '50%' }}>
               <Users color="var(--accent)" size={28} strokeWidth={2.5} />
             </div>
             <div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{role === 'Admin' ? 'Registered Patients' : 'Unique Patients Profiled'}</p>
               <h3 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-dark)' }}>{metrics.patients}</h3>
               {role === 'Admin' && <p style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.25rem' }}>{showPatients ? 'Hide Patients' : 'Click to View Roster'}</p>}
             </div>
           </div>
        )}

        {(role === 'Doctor' || role === 'Admin') && (
           <div className="glass-panel hover-lift" style={{ flex: '1 1 240px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ background: `#0ea5e920`, padding: '1rem', borderRadius: '50%' }}>
               <DollarSign color="#0ea5e9" size={28} strokeWidth={2.5} />
             </div>
             <div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>{role === 'Admin' ? 'Platform Wide Gross' : 'Doctor Earned Gross'}</p>
               <h3 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-dark)' }}>₹{metrics.earnings}</h3>
             </div>
           </div>
        )}
      </div>

      {/* Expanded Admin Registered Patients View */}
      {showPatients && role === 'Admin' && (
        <div className="animate-fade-in glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
           <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Users size={20} color="var(--accent)" /> Detailed Patients Roster
           </h3>
           
           {patientsList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>No patients registered yet.</p>
           ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Name</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Email/Contact</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Age (DOB)</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsList.map(pat => (
                      <tr key={pat._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             {pat.image ? <img src={pat.image} alt={pat.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} /> : <UserCircle size={30} color="var(--text-muted)" />}
                             {pat.name}
                           </div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)' }}>
                             <Mail size={14} color="var(--text-muted)" /> {pat.email}
                           </div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>
                           <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{calculateAge(pat.dob)} yrs</span>
                           <span style={{ fontSize: '0.8rem', display: 'block' }}>({pat.dob})</span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                           <span style={{ 
                             padding: '0.2rem 0.6rem', 
                             borderRadius: '1rem', 
                             fontSize: '0.8rem',
                             fontWeight: 600,
                             background: pat.gender === 'Male' ? '#e0f2fe' : pat.gender === 'Female' ? '#fce7f3' : 'var(--border)',
                             color: pat.gender === 'Male' ? '#0369a1' : pat.gender === 'Female' ? '#be185d' : 'var(--text-muted)'
                           }}>
                             {pat.gender}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           )}
        </div>
      )}

      {/* Expanded Appointments Detail View */}
      {(showAppointments || showHistory) && (
        <div className="animate-fade-in glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
           <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             {showHistory ? <Activity size={20} color="var(--secondary)" /> : <Calendar size={20} color="var(--primary)" />} 
             {showHistory ? 'Completed & Cancelled Records' : 'Detailed Appointments Log'}
           </h3>
           
           {displayAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>No appointments found in this category.</p>
           ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Date & Time</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>{role === 'Patient' ? 'Attending Doctor' : 'Patient'}</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Fee</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Payment Engine</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Status</th>
                      {role === 'Doctor' && !showHistory && <th style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)' }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {displayAppointments.map(appt => (
                      <tr key={appt._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>
                           <span style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{appt.slotDate.split('_').join('/')}</span>
                           <br />
                           <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{appt.slotTime}</span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                           {role === 'Patient' ? appt.doctorData?.name : appt.patientData?.name}
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>₹{appt.fee || appt.doctorData?.fee || 0}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                           {appt.payment ? 
                             <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>Secured</span> 
                           : <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>Unpaid</span>}
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                           {appt.cancelled ? <span style={{ color: 'red', fontWeight: 500 }}>Cancelled</span> : 
                            appt.isCompleted ? <span style={{ color: 'green', fontWeight: 500 }}>Completed</span> : 
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Pending</span>}
                        </td>
                        {role === 'Doctor' && (!appt.cancelled && !appt.isCompleted) && (
                           <td style={{ padding: '1rem 0.5rem' }}>
                                <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        onClick={() => handleCompleteAppointment(appt._id)}>
                                  Mark Done
                                </button>
                           </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           )}
        </div>
      )}

      {/* Shared Doctors Grid: Rendered when NO lists are toggled opened */}
      {!showAppointments && !showPatients && !showHistory && (role === 'Patient' || role === 'Admin') && (
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Users color="var(--primary)" size={28} />
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{role === 'Admin' ? 'Physician Review Pipeline' : 'Available Specialists'}</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {specialitiesList.map((spec, i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveFilter(spec)}
                 style={{ 
                   padding: '0.4rem 1rem', 
                   borderRadius: '2rem', 
                   border: `1px solid ${activeFilter === spec ? 'var(--primary)' : 'var(--border)'}`,
                   background: activeFilter === spec ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                   color: activeFilter === spec ? 'white' : 'var(--text-muted)',
                   fontWeight: 500,
                   cursor: 'pointer',
                   whiteSpace: 'nowrap',
                   transition: 'all 0.2s ease'
                 }}>
                 {spec}
               </button>
            ))}
          </div>

          {loading ? (
            <div className="flex-center" style={{ height: '300px' }}>
               <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Loading elite specialists...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="glass-panel flex-center" style={{ padding: '4rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No specialists match this criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {filteredDoctors.map(doc => (
                <div key={doc._id} className="glass-panel hover-lift" 
                     style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '220px', background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                    {doc.image ? 
                      <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                      <div className="flex-center" style={{ height: '100%', flexDirection: 'column', color: 'var(--text-muted)' }}>
                        <UserCircle size={64} opacity={0.5} />
                      </div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-dark)' }}>{doc.name}</h4>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{doc.speciality}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                       <span>Exp: <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{doc.experience}</span></span>
                       <span>Fee: <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>₹{doc.fee || 0}</span></span>
                    </div>
                  </div>
                  {role === 'Patient' ? (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSelectedDoc(doc)}>
                      Book Appointment
                    </button>
                  ) : role === 'Admin' ? (
                    doc.status === 'pending' ? (
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleUpdateDoctorStatus(doc._id, 'approved')}>Approve</button>
                          <button className="btn-outline" style={{ flex: 1, padding: '0.5rem', borderColor: 'red', color: 'red' }} onClick={() => handleUpdateDoctorStatus(doc._id, 'rejected')}>Reject</button>
                       </div>
                    ) : (
                       <div style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: 500 }}>
                         Status: <span style={{ color: doc.status === 'rejected' ? 'red' : 'green', textTransform: 'capitalize' }}>{doc.status || "Registered"}</span>
                       </div>
                    )
                  ) : (
                    <div style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Status: {doc.status || "Registered"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

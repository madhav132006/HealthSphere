import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DoctorsList = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const fetchDoctors = async (spec = '') => {
    try {
      const params = spec && spec !== 'all' ? `?specialization=${spec}` : '';
      const res = await api.get(`/doctors${params}`);
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const res = await api.get('/doctors/specializations');
      setSpecializations(res.data.specializations);
    } catch (err) {
      console.error('Failed to fetch specializations:', err);
    }
  };

  const handleFilterChange = (spec) => {
    setActiveFilter(spec);
    setLoading(true);
    fetchDoctors(spec);
  };

  const handleBookConsultation = (doctor) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedDoctor(doctor);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedDoctor) return;
    setPaymentLoading(selectedDoctor.id);

    try {
      const orderRes = await api.post('/payment/create-order', {
        doctorId: selectedDoctor.id,
        amount: selectedDoctor.fee
      });

      const data = orderRes.data;

      if (data.mode === 'demo') {
        // Demo payment - simulate success
        const verifyRes = await api.post('/payment/verify', {
          razorpay_order_id: data.orderId,
          razorpay_payment_id: 'demo_pay_' + Date.now(),
          razorpay_signature: 'demo_sig',
          doctorId: selectedDoctor.id,
          amount: selectedDoctor.fee,
          demo: true
        });

        setShowPaymentModal(false);
        navigate(`/chat/${verifyRes.data.sessionId}`);
      } else {
        // Real Razorpay payment
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'HealthSphere',
          description: `Consultation with ${data.doctorName}`,
          order_id: data.orderId,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                doctorId: selectedDoctor.id,
                amount: selectedDoctor.fee
              });

              setShowPaymentModal(false);
              navigate(`/chat/${verifyRes.data.sessionId}`);
            } catch (err) {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: 'Patient',
            email: 'patient@healthsphere.com'
          },
          theme: {
            color: '#00D4AA'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="doctors-page">
      <div className="container">
        <div className="page-header" style={{textAlign: 'center'}}>
          <span className="section-tag">Expert Panel</span>
          <h1>👨‍⚕️ Our Specialist Doctors</h1>
          <p>Consult with verified, experienced doctors across multiple specializations via secure live chat.</p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" style={{justifyContent: 'center'}}>
          <button 
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
            id="filter-all"
          >
            All Doctors
          </button>
          {specializations.map(spec => (
            <button
              key={spec}
              className={`filter-pill ${activeFilter === spec ? 'active' : ''}`}
              onClick={() => handleFilterChange(spec)}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor.id} id={`doctor-${doctor.id}`}>
              <div className="doctor-header">
                <div className="doctor-avatar">{doctor.avatar}</div>
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <div className="doctor-specialization">{doctor.specialization}</div>
                  <div className="doctor-meta">
                    <span className="doctor-rating">⭐ {doctor.rating}</span>
                    <span>• {doctor.reviews} reviews</span>
                    <span>• {doctor.experience} yrs exp</span>
                  </div>
                </div>
              </div>

              <div className="doctor-body">
                <p>{doctor.bio}</p>
                <div className="doctor-tags">
                  {doctor.languages?.map(lang => (
                    <span className="doctor-tag" key={lang}>{lang}</span>
                  ))}
                  <span className="doctor-tag">📋 {doctor.consultations}+ consultations</span>
                </div>
              </div>

              <div className="doctor-footer">
                <div>
                  <div className="doctor-fee">₹{doctor.fee} <span>/ session</span></div>
                  <div className={`doctor-status ${doctor.available ? 'online' : 'offline'}`}>
                    <span className={`status-dot ${doctor.available ? 'online' : 'offline'}`}></span>
                    {doctor.available ? `Available in ${doctor.nextAvailable}` : 'Currently Unavailable'}
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleBookConsultation(doctor)}
                  disabled={!doctor.available || paymentLoading === doctor.id}
                  id={`book-${doctor.id}`}
                >
                  {paymentLoading === doctor.id ? (
                    <><span className="spinner"></span> Processing</>
                  ) : (
                    'Book Now →'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try changing the specialization filter.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedDoctor && (
        <div className="modal-overlay" id="payment-modal" onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            
            <div className="modal-header">
              <h2>💳 Book Consultation</h2>
              <p>Confirm your appointment payment</p>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
              <div className="doctor-avatar" style={{width: '56px', height: '56px', fontSize: '1.1rem'}}>{selectedDoctor.avatar}</div>
              <div>
                <h3 style={{fontFamily: 'var(--font-heading)', fontWeight: 700}}>{selectedDoctor.name}</h3>
                <p style={{color: 'var(--accent-primary)', fontSize: '0.9rem'}}>{selectedDoctor.specialization}</p>
              </div>
            </div>

            <div className="payment-summary">
              <div className="payment-row">
                <span style={{color: 'var(--text-secondary)'}}>Consultation Fee</span>
                <span>₹{selectedDoctor.fee}</span>
              </div>
              <div className="payment-row">
                <span style={{color: 'var(--text-secondary)'}}>Session Duration</span>
                <span>30 minutes</span>
              </div>
              <div className="payment-row">
                <span style={{color: 'var(--text-secondary)'}}>Platform Fee</span>
                <span style={{color: 'var(--accent-success)'}}>FREE</span>
              </div>
              <div className="payment-row total">
                <span>Total</span>
                <span style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>₹{selectedDoctor.fee}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              style={{width: '100%'}} 
              onClick={handlePayment}
              disabled={paymentLoading}
              id="confirm-payment-btn"
            >
              {paymentLoading ? (
                <><span className="spinner"></span> Processing Payment...</>
              ) : (
                `Pay ₹${selectedDoctor.fee} & Start Chat`
              )}
            </button>

            <p style={{textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '1rem'}}>
              🔒 Secured by Razorpay • 100% Safe & Encrypted
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analysesRes, paymentsRes] = await Promise.all([
        api.get('/ai/history').catch(() => ({ data: { analyses: [] } })),
        api.get('/payment/history').catch(() => ({ data: { payments: [] } }))
      ]);

      setAnalyses(analysesRes.data.analyses || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's an overview of your health journey on HealthSphere.</p>
        </div>

        {/* Stats */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <h3>{analyses.length}</h3>
              <p>AI Analyses Done</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>{payments.length}</h3>
              <p>Doctor Consultations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-info">
              <h3>₹{payments.reduce((acc, p) => acc + (p.amount || 0), 0)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Active</h3>
              <p>Account Status</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{marginTop: '2rem'}}>
          <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem'}}>Quick Actions</h2>
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <Link to="/symptom-checker" className="btn btn-primary" id="dashboard-checker-btn">🤖 New Symptom Check</Link>
            <Link to="/doctors" className="btn btn-secondary" id="dashboard-doctors-btn">👨‍⚕️ Browse Doctors</Link>
          </div>
        </div>

        {/* Recent AI Analyses */}
        <div style={{marginTop: '2.5rem'}}>
          <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem'}}>📋 Recent AI Analyses</h2>
          {analyses.length > 0 ? (
            <div style={{display: 'grid', gap: '1rem'}}>
              {analyses.slice(0, 5).map((analysis, i) => (
                <div className="glass-card-static" key={i} style={{padding: '1.25rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem'}}>
                    <div>
                      <h4 style={{marginBottom: '0.25rem'}}>Symptoms: {analysis.symptoms?.substring(0, 80)}{analysis.symptoms?.length > 80 ? '...' : ''}</h4>
                      <p style={{color: 'var(--text-tertiary)', fontSize: '0.82rem'}}>
                        {new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {analysis.result?.severity && (
                      <span className={`severity-indicator severity-${analysis.result.severity}`} style={{fontSize: '0.78rem', padding: '0.3rem 0.8rem'}}>
                        {analysis.result.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {analysis.result?.conditions && (
                    <div style={{marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      {analysis.result.conditions.map((c, j) => (
                        <span key={j} className="doctor-tag">{c.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{padding: '2rem'}}>
              <div className="empty-icon">🤖</div>
              <h3>No analyses yet</h3>
              <p>Try our AI Symptom Checker to get your first health analysis!</p>
              <Link to="/symptom-checker" className="btn btn-primary" style={{marginTop: '1rem'}}>Get Started</Link>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div style={{marginTop: '2.5rem'}}>
          <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem'}}>💳 Payment History</h2>
          {payments.length > 0 ? (
            <div style={{display: 'grid', gap: '1rem'}}>
              {payments.slice(0, 5).map((payment, i) => (
                <div className="glass-card-static" key={i} style={{padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'}}>
                  <div>
                    <h4>Doctor Consultation</h4>
                    <p style={{color: 'var(--text-tertiary)', fontSize: '0.82rem'}}>
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span style={{fontFamily: 'var(--font-heading)', fontWeight: 700}}>₹{payment.amount}</span>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      background: 'rgba(16,185,129,0.1)',
                      color: 'var(--accent-success)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      ✓ {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{padding: '2rem'}}>
              <div className="empty-icon">💳</div>
              <h3>No payments yet</h3>
              <p>Book your first doctor consultation to see payment history here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

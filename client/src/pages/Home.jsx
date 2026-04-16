import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              AI-Powered Healthcare Platform
            </div>

            <h1>
              Your Health, <br />
              <span className="gradient-text">Reimagined with AI</span>
            </h1>

            <p className="hero-description">
              Get instant AI-powered symptom analysis, connect with verified specialist 
              doctors via live chat, and take charge of your health — all in one intelligent platform.
            </p>

            <div className="hero-actions">
              <Link to="/symptom-checker" className="btn btn-primary btn-lg" id="hero-cta-checker">
                🤖 Check Symptoms
              </Link>
              <Link to="/doctors" className="btn btn-secondary btn-lg" id="hero-cta-doctors">
                👨‍⚕️ Find a Doctor
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-value">10K+</div>
                <div className="stat-label">Health Analyses</div>
              </div>
              <div className="hero-stat">
                <div className="stat-value">50+</div>
                <div className="stat-label">Expert Doctors</div>
              </div>
              <div className="hero-stat">
                <div className="stat-value">98%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
              <div className="hero-stat">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Available</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>
            <div className="hero-orb hero-orb-3"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2>Why Choose <span style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>HealthSphere</span></h2>
            <p>Experience healthcare that's intelligent, accessible, and built for the modern world.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Symptom Analysis</h3>
              <p>
                Describe your symptoms and our advanced AI analyzes them instantly — 
                providing possible conditions, recommended medicines, severity levels, 
                and actionable health advice.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Live Doctor Chat</h3>
              <p>
                Connect with verified specialist doctors through real-time WebSocket 
                chat. Get personalized medical advice, prescriptions, and follow-up 
                care — all from home.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>
                Pay securely for consultations via Razorpay. Your transactions are 
                protected with bank-grade encryption. Transparent pricing with no 
                hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works" style={{background: 'var(--bg-secondary)'}}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2>Simple Steps to Better Health</h2>
            <p>Getting expert healthcare has never been this easy.</p>
          </div>

          <div className="how-it-works">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Describe Symptoms</h3>
              <p>Enter your symptoms in our AI-powered checker for an instant preliminary analysis.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Get AI Analysis</h3>
              <p>Receive detailed insights on possible conditions, medicines, and severity level.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Book a Doctor</h3>
              <p>Choose from our panel of expert doctors and pay securely via Razorpay.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Live Consultation</h3>
              <p>Chat with your doctor in real-time and get personalized medical guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" id="cta-section">
        <div className="container">
          <div style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '600px',
              background: 'var(--gradient-glow)',
              pointerEvents: 'none'
            }}></div>
            <div style={{position: 'relative', zIndex: 2}}>
              <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem'}}>
                Ready to Take Control of Your Health?
              </h2>
              <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem'}}>
                Join thousands who've already discovered smarter healthcare with HealthSphere.
              </p>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                <Link to={isAuthenticated ? "/symptom-checker" : "/register"} className="btn btn-primary btn-lg" id="cta-signup">
                  {isAuthenticated ? '🤖 Try AI Checker' : '🚀 Get Started Free'}
                </Link>
                <Link to="/doctors" className="btn btn-outline btn-lg" id="cta-doctors">
                  Browse Doctors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="page-wrapper" id="about-page">
      <div className="container">
        <div className="page-header" style={{textAlign: 'center'}}>
          <span className="section-tag">About Us</span>
          <h1>About <span style={{background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>HealthSphere</span></h1>
          <p>We're building the future of accessible, intelligent healthcare for everyone.</p>
        </div>

        {/* Mission */}
        <div className="glass-card-static" style={{maxWidth: '800px', margin: '0 auto 2rem', textAlign: 'center'}}>
          <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem'}}>🎯 Our Mission</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8}}>
            HealthSphere was born from a simple belief: everyone deserves access to quality healthcare, 
            regardless of where they are. We combine the power of Artificial Intelligence with expert 
            medical professionals to create a platform that makes healthcare more accessible, affordable, 
            and intelligent. Our AI symptom checker provides instant preliminary analysis, while our panel 
            of verified doctors offers personalized consultations through secure live chat.
          </p>
        </div>

        {/* Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem'}}>
          {[
            { icon: '🤖', value: '10,000+', label: 'AI Analyses Performed' },
            { icon: '👨‍⚕️', value: '50+', label: 'Verified Doctors' },
            { icon: '💬', value: '25,000+', label: 'Consultations Completed' },
            { icon: '⭐', value: '4.8/5', label: 'User Rating' }
          ].map((stat, i) => (
            <div key={i} className="glass-card-static" style={{textAlign: 'center', padding: '1.5rem'}}>
              <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{stat.icon}</div>
              <div style={{fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{stat.value}</div>
              <div style={{color: 'var(--text-tertiary)', fontSize: '0.85rem'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div style={{marginBottom: '3rem'}}>
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2>How HealthSphere Works</h2>
            <p>Get from symptoms to solutions in four simple steps.</p>
          </div>

          <div className="how-it-works">
            <div className="step-card glass-card-static">
              <div className="step-number">1</div>
              <h3>Enter Symptoms</h3>
              <p>Describe what you're feeling — our AI understands natural language and medical terms alike.</p>
            </div>
            <div className="step-card glass-card-static">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your symptoms against medical databases and provides possible conditions & medicines.</p>
            </div>
            <div className="step-card glass-card-static">
              <div className="step-number">3</div>
              <h3>Choose a Doctor</h3>
              <p>Browse verified specialists, check ratings and fees, and book a consultation securely via Razorpay.</p>
            </div>
            <div className="step-card glass-card-static">
              <div className="step-number">4</div>
              <h3>Live Chat</h3>
              <p>Connect instantly with your doctor through real-time WebSocket chat for personalized medical advice.</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass-card-static" style={{maxWidth: '800px', margin: '0 auto 2rem'}}>
          <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center'}}>⚡ Built With Modern Tech</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
            {[
              { label: 'Frontend', value: 'React + Vite', icon: '⚛️' },
              { label: 'Backend', value: 'Express.js + Node.js', icon: '🟢' },
              { label: 'Real-time Chat', value: 'Socket.io (WebSocket)', icon: '💬' },
              { label: 'AI Engine', value: 'Google Gemini API', icon: '🤖' },
              { label: 'Payments', value: 'Razorpay Gateway', icon: '💳' },
              { label: 'Authentication', value: 'JWT + bcrypt', icon: '🔐' }
            ].map((tech, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'}}>
                <span style={{fontSize: '1.3rem'}}>{tech.icon}</span>
                <div>
                  <div style={{fontSize: '0.78rem', color: 'var(--text-tertiary)'}}>{tech.label}</div>
                  <div style={{fontWeight: 600, fontSize: '0.92rem'}}>{tech.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{textAlign: 'center', marginTop: '3rem'}}>
          <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem'}}>Ready to Experience Smart Healthcare?</h2>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <Link to="/symptom-checker" className="btn btn-primary btn-lg" id="about-cta-checker">🤖 Try AI Checker</Link>
            <Link to="/doctors" className="btn btn-outline btn-lg" id="about-cta-doctors">👨‍⚕️ Meet Our Doctors</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

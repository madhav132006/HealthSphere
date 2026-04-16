import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>🏥 Health<span>Sphere</span></h3>
            <p>
              Your AI-powered health companion. Get instant symptom analysis, 
              connect with expert doctors, and take control of your health journey — 
              all from the comfort of your home.
            </p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/symptom-checker">AI Symptom Checker</Link></li>
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Specializations</h4>
            <ul>
              <li><a href="#">General Physician</a></li>
              <li><a href="#">Cardiologist</a></li>
              <li><a href="#">Dermatologist</a></li>
              <li><a href="#">Pediatrician</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 HealthSphere. All rights reserved.</p>
          <p>Made with ❤️ for better healthcare</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

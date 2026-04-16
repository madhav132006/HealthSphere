import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">🏥</div>
          <div className="brand-text">Health<span>Sphere</span></div>
        </Link>

        <ul className="navbar-links" style={mobileOpen ? { display: 'flex', position: 'absolute', top: '72px', left: 0, right: 0, background: 'rgba(10,22,40,0.95)', flexDirection: 'column', padding: '1rem', borderBottom: '1px solid var(--border-color)' } : {}}>
          <li><Link to="/" className={isActive('/')} onClick={() => setMobileOpen(false)}>Home</Link></li>
          <li><Link to="/symptom-checker" className={isActive('/symptom-checker')} onClick={() => setMobileOpen(false)}>AI Checker</Link></li>
          <li><Link to="/doctors" className={isActive('/doctors')} onClick={() => setMobileOpen(false)}>Doctors</Link></li>
          <li><Link to="/about" className={isActive('/about')} onClick={() => setMobileOpen(false)}>About</Link></li>
          {isAuthenticated && (
            <li><Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMobileOpen(false)}>Dashboard</Link></li>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="navbar-user">
                <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                <span>{user?.name?.split(' ')[0]}</span>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={logout} id="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-secondary" id="login-btn">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary" id="register-btn">Sign Up</Link>
            </>
          )}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} id="mobile-menu-btn">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

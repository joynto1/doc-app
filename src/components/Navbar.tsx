import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../components/Navbar.css';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    signOut(auth);
    toggleMobileMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
         <a href="/"> <img 
            src="./healpoint_logo.png" 
            alt="HealPoint Logo" 
            className="logo-image"
            onError={(e) => {
              console.error('Error loading image:', e);
              const img = e.target as HTMLImageElement;
              console.log('Attempted image source:', img.src);
            }}
          /><span className="logo-text text-blue ">HealPoint</span></a>
          
        </div>
        <div className="nav-links desktop-nav">
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
          <Link to="/all-doctors" className={`nav-link${location.pathname === '/all-doctors' ? ' active' : ''}`}>All Doctors</Link>
          <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}>About</Link>
          <Link to="/contact" className={`nav-link${location.pathname === '/contact' ? ' active' : ''}`}>Contact</Link>
        </div>
      </div>
      <div className="navbar-right">
        <Link to="/admin-panel" className={`admin-btn${location.pathname === '/admin-panel' ? ' active' : ''}`}>Admin Panel</Link>
        {user ? (
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-name">{user.displayName}</span>
            <button className="logout-btn" onClick={() => signOut(auth)}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className={`login-btn desktop-only${location.pathname === '/login' ? ' active' : ''}`}>Login</Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <button className="close-menu-btn" onClick={toggleMobileMenu}></button>
          
          {/* Main Navigation Links */}
          <div className="mobile-nav-section">
            <Link to="/" className={`mobile-nav-link${location.pathname === '/' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="home">🏠</span> Home
            </Link>
            <Link to="/all-doctors" className={`mobile-nav-link${location.pathname === '/all-doctors' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="doctors">🩺</span> All Doctors
            </Link>
            <Link to="/about" className={`mobile-nav-link${location.pathname === '/about' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="about">ℹ️</span> About
            </Link>
            <Link to="/contact" className={`mobile-nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="contact">📞</span> Contact
            </Link>
          </div>

          {/* Admin and Account Section */}
          <div className="mobile-nav-section">
            <Link to="/admin-panel" className={`mobile-nav-link admin-link${location.pathname === '/admin-panel' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span className="admin-icon">⚙️</span> Admin Panel
            </Link>
            
            {user ? (
              <>
                <div className="mobile-user-info">
                  <span className="user-icon">👤</span>
                  <span className="user-name">{user.displayName}</span>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={`mobile-nav-link login-link${location.pathname === '/login' ? ' active' : ''}`} onClick={toggleMobileMenu}>
                <span className="account-icon">📝</span> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
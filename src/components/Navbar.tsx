import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../components/Navbar.css';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <a href="/"  >
            <img 
              src="./logo_healPoint.jpg" 
              alt="HealPoint Logo" 
              className="logo-image"
              onError={(e) => {
                console.error('Error loading image:', e);
                const img = e.target as HTMLImageElement;
                console.log('Attempted image source:', img.src);
              }}
            />
          </a>
        </div>
        <div className="nav-links desktop-nav">
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
          <Link to="/all-doctors" className={`nav-link${location.pathname === '/all-doctors' ? ' active' : ''}`}>All Doctors</Link>
          <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}>About</Link>
          <Link to="/contact" className={`nav-link${location.pathname === '/contact' ? ' active' : ''}`}>Contact</Link>
          <Link to="/admin-panel" className={`nav-link${location.pathname === '/admin-panel' ? ' active' : ''}`}>Admin</Link>
        </div>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            {user.email === 'admin@healpoint.com' && (
              <Link to="/admin-panel" className={`admin-btn${location.pathname === '/admin-panel' ? ' active' : ''}`}>
                Admin Panel
              </Link>
            )}
            <div className="profile-dropdown" ref={dropdownRef}>
              <button 
                className="profile-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="navbar-avatar-circle">
                  {getInitials(user.displayName || user.email || '')}
                </div>
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                   
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/profile');
                      setShowDropdown(false);
                    }}
                  >
                    <span className="dropdown-icon">👤</span>
                    <span className="profile-name">{user.displayName}</span>
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/my-appointments');
                      setShowDropdown(false);
                    }}
                  >
                    <span className="dropdown-icon">📅</span>
                    My Appointments
                  </button>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {!user && (
          <Link to="/login" className="login-btn desktop-only">Login</Link>
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
            {user && (
              <>
                {user.email === 'admin@healpoint.com' && (
                  <Link to="/admin-panel" className={`mobile-nav-link admin-link${location.pathname === '/admin-panel' ? ' active' : ''}`} onClick={toggleMobileMenu}>
                    <span className="admin-icon">⚙️</span> Admin Panel
                  </Link>
                )}
                <div className="mobile-user-info">
                  <div className="mobile-avatar-circle">
                    {getInitials(user.displayName || user.email || '')}
                  </div>
                  <span className="user-name">{user.displayName || user.email}</span>
                </div>
                <Link to="/profile" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  <span className="dropdown-icon">👤</span> Profile
                </Link>
                <Link to="/my-appointments" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  <span className="dropdown-icon">📅</span> My Appointments
                </Link>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span> Logout
                </button>
              </>
            )}
            {!user && (
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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './CreateAccount.css';

const CreateAccount: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.com',
      'throwawaymail.com',
      'mailinator.com',
      'guerrillamail.com',
      'yopmail.com',
      'temp-mail.org',
      'fakeinbox.com',
      'tempmail.net',
      'tempail.com',
      'tempmailaddress.com',
      'tempmail.ninja',
      'tempmail.space',
      'tempmail.pro',
      'tempmail.xyz',
      'tempmail.io',
      'tempmail.me',
      'tempmail.co',
      'tempmail.cc',
      'tempmail.biz',
      'tempmail.info'
    ];

    const domain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
      return 'Please use a genuine email address';
    }

    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email before submission
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Set displayName to fullName
      await updateProfile(userCredential.user, { displayName: fullName });
      navigate('/login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or login.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="create-account-container">
      <form className="create-account-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtitle">Please sign up to book appointment</p>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            minLength={2}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            placeholder="Enter your email address"
            className={emailError ? 'error' : ''}
          />
          {emailError && <div className="error-message">{emailError}</div>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Confirm your password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="create-account-btn"
          disabled={!!emailError}
        >
          Create Account
        </button>

        <div className="login-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Login here</span>
        </div>
      </form>
    </div>
  );
};

export default CreateAccount; 
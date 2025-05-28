import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('Current user:', currentUser);
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        setPhoneNumber(currentUser.phoneNumber || '');
      } else {
        navigate('/login', { state: { from: '/profile' } });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user) {
        console.error('No user found');
        navigate('/login', { state: { from: '/profile' } });
        return;
      }

      console.log('Starting profile update...');
      console.log('Current email:', user.email);
      console.log('New email:', email);
      console.log('Current name:', user.displayName);
      console.log('New name:', displayName);

      // If email is being changed, we need to reauthenticate
      if (email !== user.email) {
        console.log('Email change detected, requesting password...');
        if (!password) {
          setError('Please enter your password to update email');
          setShowPasswordInput(true);
          setLoading(false);
          return;
        }

        try {
          console.log('Attempting reauthentication...');
          // Reauthenticate user
          const credential = EmailAuthProvider.credential(user.email!, password);
          await reauthenticateWithCredential(user, credential);
          console.log('Reauthentication successful');
          
          // Update email
          console.log('Updating email...');
          await updateEmail(user, email);
          console.log('Email updated successfully');
        } catch (err: any) {
          console.error('Error during email update:', err);
          if (err.code === 'auth/wrong-password') {
            setError('Incorrect password');
          } else {
            setError(err.message || 'Failed to update email');
          }
          setLoading(false);
          return;
        }
      }

      // Update profile name
      console.log('Updating profile name...');
      await updateProfile(user, {
        displayName
      });
      console.log('Profile name updated successfully');

      // Force refresh the user object
      const updatedUser = auth.currentUser;
      if (updatedUser) {
        setUser(updatedUser);
        setDisplayName(updatedUser.displayName || '');
        setEmail(updatedUser.email || '');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setShowPasswordInput(false);
      setPassword('');
    } catch (err: any) {
      console.error('Error during profile update:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>User Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-section">
            <div className="avatar-circle">
              {getInitials(displayName)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              disabled={!isEditing || loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={!isEditing || loading}
              required
            />
          </div>

          {showPasswordInput && (
            <div className="form-group">
              <label htmlFor="password">Current Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="button-group">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="save-button"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setShowPasswordInput(false);
                    setPassword('');
                    // Reset form values to current user data
                    if (user) {
                      setDisplayName(user.displayName || '');
                      setEmail(user.email || '');
                    }
                  }}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile; 
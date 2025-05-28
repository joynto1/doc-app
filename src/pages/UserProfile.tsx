import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { auth, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('Current user:', currentUser);
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        setPhoneNumber(currentUser.phoneNumber || '');
        setProfileImage(currentUser.photoURL);
      } else {
        navigate('/login', { state: { from: '/profile' } });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    return /^\+?[\d\s-]{10,}$/.test(phone);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, {
        photoURL: downloadURL
      });
      
      setProfileImage(downloadURL);
      setSuccess('Profile picture updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !password) {
      setError('Please enter your password to delete account');
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError(err.message || 'Failed to delete account');
      }
    } finally {
      setLoading(false);
    }
  };

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

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      // If email is being changed, we need to reauthenticate
      if (email !== user.email) {
        if (!password) {
          setError('Please enter your password to update email');
          setShowPasswordInput(true);
          setLoading(false);
          return;
        }

        try {
          const credential = EmailAuthProvider.credential(user.email!, password);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, email);
        } catch (err: any) {
          if (err.code === 'auth/wrong-password') {
            setError('Incorrect password');
          } else {
            setError(err.message || 'Failed to update email');
          }
          setLoading(false);
          return;
        }
      }

      // Update profile name and photo URL
      await updateProfile(user, {
        displayName
      });

      // Note: Phone number updates are not supported directly through updateProfile
      // You would need to implement this through a custom backend or Firebase Cloud Functions
      // For now, we'll just store it in the state
      setPhoneNumber(phoneNumber);

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
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
            <div 
              className="avatar-circle"
              onClick={() => isEditing && fileInputRef.current?.click()}
              style={{ 
                backgroundImage: profileImage ? `url(${profileImage})` : undefined,
                cursor: isEditing ? 'pointer' : 'default'
              }}
            >
              {!profileImage && getInitials(displayName)}
            </div>
            {isEditing && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            )}
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

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              disabled={!isEditing || loading}
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
                    if (user) {
                      setDisplayName(user.displayName || '');
                      setEmail(user.email || '');
                      setPhoneNumber(user.phoneNumber || '');
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

          {!isEditing && (
            <div className="delete-account-section">
            <p>If You Want Delete Your Account ?</p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="delete-account-button"
              >
                Delete Account
              </button>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="delete-confirmation">
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="form-group">
                <label htmlFor="deletePassword">Enter your password to confirm</label>
                <input
                  type="password"
                  id="deletePassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                />
              </div>
              <div className="button-group">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="confirm-delete-button"
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPassword('');
                  }}
                  className="cancel-button"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile; 
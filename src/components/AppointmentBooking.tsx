import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AppointmentBooking.css';
import { PhoneAuthCredential } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  doctorName: string;
  reason: string;
  doctorId: string;
  appointmentId?: string;
}

const AppointmentBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorName, reason, doctorId, appointmentId } = location.state as LocationState & { appointmentId?: string };
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: currentUser?.email || '',
    date: '',
    time: '',
    phone:'',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<{id: string, action: string} | null>(null);

  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [suggestedDoctor, setSuggestedDoctor] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorName) {
      const fetchDoctors = async () => {
        const doctorsRef = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsRef);
        const doctors = querySnapshot.docs.map(doc => doc.data());
        const available = doctors.filter((doc: any) => doc.available);
        setAvailableDoctors(available);
        if (available.length > 0) {
          const randomDoc = available[Math.floor(Math.random() * available.length)];
          setSuggestedDoctor(randomDoc.name);
        }
      };
      fetchDoctors();
    }
  }, [doctorName]);

  if (!currentUser) {
    return (
      <div className="not-logged-in">
        <h2>Please log in to book an appointment.</h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!currentUser?.email) {
      setError('Please make sure you are logged in with an email address.');
      setLoading(false);
      return;
    }

    try {
      const appointmentsRef = collection(db, 'appointments');
      await addDoc(appointmentsRef, {
        doctorId,
        doctorName,
        patientName: formData.patientName,
        patientEmail: currentUser.email,
        reason,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        phone: formData.phone,
        createdAt: new Date().toISOString()
      });

      navigate('/appointment-success');
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = async () => {
    if (!appointmentId) {
      navigate(-1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
      // Refresh the page by navigating to the same route
      window.location.reload();
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
      console.error('Error canceling appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });
      setActionDone({ id: appointmentId, action: newStatus });
      setTimeout(() => setActionDone(null), 2000); // Show 'Done' for 2 seconds
    } catch (err) {
      alert('Failed to update appointment status.');
    }
  };

  return (
    <div className="appointment-booking-container">
      <div className="appointment-booking-card">
        <h1>Book Appointment</h1>
        <div className="doctor-info">
          <h2>Dr. {doctorName}</h2>
          <p className="reason">Reason: {reason}</p>
        </div>

        {!doctorName && suggestedDoctor && (
          <div className="suggestion">
            <p>No doctor selected. We suggest: <strong>{suggestedDoctor}</strong></p>
            <button onClick={() => navigate('/appointment', { state: { doctorName: suggestedDoctor } })}>
              Book with {suggestedDoctor}
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="patientName">Full Name</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="patientEmail">Email</label>
            <input
              type="email"
              id="patientEmail"
              name="patientEmail"
              value={currentUser?.email || ''}
              disabled
              placeholder="Your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Preferred Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Preferred Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? 'Canceling...' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBooking; 
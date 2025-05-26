import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AppointmentList.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
  createdAt: string;
  patientEmail: string;
}

const ManageAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('patientEmail', '==', currentUser.email),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const appointmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];
        setAppointments(appointmentsList);
      } catch (err) {
        setError('Unable to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#00c853';
      case 'pending': return '#ffb400';
      case 'cancelled': return '#ff3d00';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (!currentUser) {
    return (
      <div className="error">
        Please log in to view your appointments.
      </div>
    );
  }

  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="appointments-container">
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>You don't have any appointments yet.</p>
          <Link to="/all-doctors" className="book-appointment-btn">
            Book an Appointment
          </Link>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>Dr. {appointment.doctorName}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-details">
                <p><strong>Date:</strong> {formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><strong>Reason:</strong> {appointment.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments; 
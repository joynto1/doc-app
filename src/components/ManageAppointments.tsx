import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AppointmentList.css';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
  createdAt: string;
}

const ManageAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
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
  }, []);

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

  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="appointment-list-container">
      <div className="appointment-list-header">
        <h1>Manage Appointments</h1>
        <p>View all appointments and their status</p>
      </div>
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>Dr. {appointment.doctorName}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status === 'pending' && '⏳ Pending'}
                  {appointment.status === 'confirmed' && '✅ Confirmed'}
                  {appointment.status === 'cancelled' && '❌ Cancelled'}
                </span>
              </div>
              <div className="status-message">
                {appointment.status === 'pending' && 'Waiting for admin approval'}
                {appointment.status === 'confirmed' && 'Appointment is confirmed!'}
                {appointment.status === 'cancelled' && 'This appointment was cancelled.'}
              </div>
              <div className="appointment-details">
                <div className="detail-item">
                  <span className="label">Patient:</span>
                  <span className="value">{appointment.patientName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(appointment.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{appointment.time}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Reason:</span>
                  <span className="value">{appointment.reason}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Booked on:</span>
                  <span className="value">{formatDate(appointment.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments; 
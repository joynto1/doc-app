import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Appointment.css';
import { auth } from '../firebaseConfig';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createUserWithEmailAndPassword, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface LocationState {
  doctorName: string;
}

const Appointment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorName } = (location.state as LocationState) || { doctorName: 'Selected Doctor' };

  const { currentUser } = useAuth();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');

  // Generate time slots from 9 AM to 5 PM
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '09:30 AM', available: true },
    { id: '3', time: '10:00 AM', available: true },
    { id: '4', time: '10:30 AM', available: true },
    { id: '5', time: '11:00 AM', available: true },
    { id: '6', time: '11:30 AM', available: true },
    { id: '7', time: '12:00 PM', available: true },
    { id: '8', time: '12:30 PM', available: true },
    { id: '9', time: '01:00 PM', available: true },
    { id: '10', time: '01:30 PM', available: true },
    { id: '11', time: '02:00 PM', available: true },
    { id: '12', time: '02:30 PM', available: true },
    { id: '13', time: '03:00 PM', available: true },
    { id: '14', time: '03:30 PM', available: true },
    { id: '15', time: '04:00 PM', available: true },
    { id: '16', time: '04:30 PM', available: true },
    { id: '17', time: '05:00 PM', available: true },
  ];

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTimeSlot(''); // Reset time slot when date changes
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTimeSlot && reason && patientName && phone) {
      const selectedTime = timeSlots.find(slot => slot.id === selectedTimeSlot)?.time;
      try {
        await addDoc(collection(db, 'appointments'), {
          patientName,
          phone,
          doctorName,
          date: selectedDate,
          time: selectedTime,
          reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
          patientEmail: currentUser?.email || '',
        });
        setConfirmation(
          `Appointment booked for ${patientName} (${phone}) with ${doctorName} for ${selectedDate} at ${selectedTime}. Reason: ${reason}`
        );
        setSelectedDate('');
        setSelectedTimeSlot('');
        setReason('');
        setPatientName('');
        setPhone('');
      } catch (error) {
        alert('Failed to book appointment. Please try again.');
      }
    } else {
      alert('Please enter your name, phone, select date, time slot, and enter a reason.');
    }
  };

  const handleBookAppointment = (doctorName: string) => {
    // Navigate to appointment page with doctor info
    navigate('/appointment', { state: { doctorName } });
  };

  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const unsubscribe = onSnapshot(appointmentsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
      setLoadingAppointments(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="appointment-container">
      <div className="appointment-card">
        <h2>Book Your Appointment</h2>
        <div className="doctor-info">
          <h3>{doctorName}</h3>
        </div>
        {confirmation && (
          <div className="confirmation-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
            {confirmation}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patientName">Patient Name:</label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              required
              placeholder="Enter your name"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientEmail">Email:</label>
            <input
              type="email"
              id="patientEmail"
              value={currentUser?.email || ''}
              disabled
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="Enter your phone number"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Select Date:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={today}
              max={maxDateStr}
              required
            />
          </div>

          {selectedDate && (
            <div className="form-group">
              <label>Select Time Slot:</label>
              <div className="time-slots-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`time-slot-btn ${selectedTimeSlot === slot.id ? 'selected' : ''} ${
                      !slot.available ? 'unavailable' : ''
                    }`}
                    onClick={() => handleTimeSlotSelect(slot.id)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="reason">Reason for Appointment:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              required
              placeholder="Describe your reason for the appointment"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <button
            type="submit"
            className="book-btn"
            disabled={!selectedDate || !selectedTimeSlot || !reason || !patientName || !phone}
          >
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Appointment; 
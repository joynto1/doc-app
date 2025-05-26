import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import './AdminPanel.css';

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Neurologist',
  'Obstetrician/Gynecologist',
  'Ophthalmologist',
  'Orthopedist',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Rheumatologist',
  'Urologist',
  'ENT Specialist',
  'Dentist',
  'Surgeon',
  'Anesthesiologist',
  'Radiologist',
  'Pathologist'
];

interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
  featured: boolean;
  about: string;
}

interface Appointment {
  id?: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  reason: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  phone?: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newDoctor, setNewDoctor] = useState<Doctor>({
    name: '',
    specialty: '',
    image: '',
    available: true,
    experience: '',
    appointmentReasons: [],
    featured: false,
    about: ''
  });
  const [newReason, setNewReason] = useState('');
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [actionDone, setActionDone] = useState<{id: string, action: string} | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-select-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDoctors = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const querySnapshot = await getDocs(doctorsRef);
      const doctorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctors');
      setLoading(false);
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Appointment[];
      
      // Sort appointments by date and time only
      const sortedData = data.sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // If dates are the same, sort by time
        try {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          
          // Validate time format
          if (timeA.length !== 2 || timeB.length !== 2) {
            return 0;
          }
          
          // Convert time to minutes for easier comparison
          const minutesA = timeA[0] * 60 + timeA[1];
          const minutesB = timeB[0] * 60 + timeB[1];
          
          return minutesA - minutesB;
        } catch (error) {
          console.error('Error parsing time:', error);
          return 0;
        }
      });
      
      setAppointments(sortedData);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    }
    setLoadingAppointments(false);
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorsRef = collection(db, 'doctors');
      await addDoc(doctorsRef, {
        ...newDoctor,
        appointmentReasons: newDoctor.appointmentReasons || []
      });
      setNewDoctor({
        name: '',
        specialty: '',
        image: '',
        available: true,
        experience: '',
        appointmentReasons: [],
        featured: false,
        about: ''
      });
      setNewReason('');
      fetchDoctors();
    } catch (err) {
      setError('Failed to add doctor');
      console.error('Error adding doctor:', err);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoc(doc(db, 'doctors', doctorId));
        fetchDoctors();
      } catch (err) {
        setError('Failed to delete doctor');
        console.error('Error deleting doctor:', err);
      }
    }
  };

  const handleToggleAvailability = async (doctorId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        available: !currentStatus
      });
      fetchDoctors();
    } catch (err) {
      setError('Failed to update doctor availability');
      console.error('Error updating doctor:', err);
    }
  };

  const handleToggleFeatured = async (doctorId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        featured: !currentStatus
      });
      fetchDoctors();
    } catch (err) {
      setError('Failed to update doctor featured status');
      console.error('Error updating doctor:', err);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });
      setActionDone({ id: appointmentId, action: newStatus });
      setTimeout(() => setActionDone(null), 2000);
      fetchAppointments();
    } catch (err) {
      alert('Failed to update appointment status.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
        setActionDone({ id: appointmentId, action: 'deleted' });
        setTimeout(() => setActionDone(null), 2000);
        fetchAppointments();
      } catch (err) {
        alert('Failed to delete appointment.');
      }
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setNewDoctor({
      name: doctor.name,
      specialty: doctor.specialty,
      image: doctor.image,
      available: doctor.available,
      experience: doctor.experience,
      appointmentReasons: doctor.appointmentReasons,
      featured: doctor.featured,
      about: doctor.about || ''
    });
    setNewReason('');
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor?.id) return;

    try {
      await updateDoc(doc(db, 'doctors', editingDoctor.id), {
        ...newDoctor,
        appointmentReasons: newDoctor.appointmentReasons || []
      });
      setEditingDoctor(null);
      setNewDoctor({
        name: '',
        specialty: '',
        image: '',
        available: true,
        experience: '',
        appointmentReasons: [],
        featured: false,
        about: ''
      });
      setNewReason('');
      fetchDoctors();
    } catch (err) {
      setError('Failed to update doctor');
      console.error('Error updating doctor:', err);
    }
  };

  // Add this new function to filter appointments by date
  const getFilteredAppointments = () => {
    if (!selectedDate) return appointments;
    return appointments.filter(app => app.date === selectedDate);
  };

  // Function to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  // Function to generate calendar days
  const generateCalendarDays = () => {
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day disabled"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate === dateString;
      const hasAppointments = appointments.some(app => app.date === dateString);
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasAppointments ? 'has-appointments' : ''}`}
          onClick={() => setSelectedDate(dateString)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  // Function to navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-actions">
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Manage Doctors
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Manage Appointments
        </button>
      </div>

      {activeTab === 'doctors' ? (
        <>
          <section className="add-doctor-section">
            <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form onSubmit={editingDoctor ? handleUpdateDoctor : handleAddDoctor} className="add-doctor-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Dr. John Doe"
                />
              </div>

              <div className="form-group">
                <label>Specialty:</label>
                <select
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, specialty: e.target.value }))}
                  required
                  className="specialty-select"
                >
                  <option value="">Select a specialty</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Endocrinologist">Endocrinologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Obstetrician">Obstetrician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  {/* <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Orthopedist">Orthopedist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Pulmonologist">Pulmonologist</option>
                  <option value="Rheumatologist">Rheumatologist</option>
                  <option value="Urologist">Urologist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Surgeon">Surgeon</option>
                  <option value="Anesthesiologist">Anesthesiologist</option>
                  <option value="Radiologist">Radiologist</option>
                  <option value="Pathologist">Pathologist</option> */}
                </select>
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="url"
                  value={newDoctor.image}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, image: e.target.value }))}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Experience:</label>
                <input
                  type="text"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: e.target.value }))}
                  required
                  placeholder="15 years"
                />
              </div>

              <div className="form-group">
                <label>About:</label>
                <textarea
                  value={newDoctor.about}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, about: e.target.value }))}
                  placeholder="Enter doctor's about information, qualifications, and achievements..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Appointment Reasons (comma-separated):</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="General Checkup, Follow-up, Consultation"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newReason.trim()) {
                      setNewDoctor(prev => ({
                        ...prev,
                        appointmentReasons: [...prev.appointmentReasons, newReason.trim()]
                      }));
                      setNewReason('');
                    }
                  }}
                >
                  Add Reason
                </button>
                <div className="reasons-list">
                  {newDoctor.appointmentReasons.map((reason, index) => (
                    <div key={index} className="reason-tag">
                      {reason}
                      <button
                        type="button"
                        onClick={() => {
                          setNewDoctor(prev => ({
                            ...prev,
                            appointmentReasons: prev.appointmentReasons.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-btn">
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </button>
              {editingDoctor && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditingDoctor(null);
                    setNewDoctor({
                      name: '',
                      specialty: '',
                      image: '',
                      available: true,
                      experience: '',
                      appointmentReasons: [],
                      featured: false,
                      about: ''
                    });
                    setNewReason('');
                  }}
                >
                  Cancel Edit
                </button> 
              )}
            </form>
          </section>

          <section className="doctors-list-section">
            <h2>Current Doctors</h2>
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="current-doctor-card">
                  <img src={doctor.image} alt={doctor.name} />
                  <h3>{doctor.name}</h3>
                  <p>Specialty: {doctor.specialty}</p>
                  <p>Experience: {doctor.experience}</p>
                  {doctor.about && <p className="doctor-about">{doctor.about}</p>}
                  <div className="doctor-actions">
                    <button
                      className={`availability-btn ${doctor.available ? 'available' : 'unavailable'}`}
                      onClick={() => handleToggleAvailability(doctor.id!, doctor.available)}
                    >
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </button>
                    <button
                      className={`featured-btn ${doctor.featured ? 'featured' : 'not-featured'}`}
                      onClick={() => handleToggleFeatured(doctor.id!, doctor.featured)}
                    >
                      {doctor.featured ? 'Featured' : 'Not Featured'}
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteDoctor(doctor.id!)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="appointments-section">
          <h2>Appointments</h2>
          <div className="date-select-container">
            <div className="date-select-header">
              <div className="date-select-icon">📅</div>
              <h3 className="date-select-title">Filter by Date</h3>
            </div>
            <div className="date-select-wrapper">
              <input
                type="text"
                className="date-select-input"
                value={selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
                onClick={() => setShowCalendar(true)}
                readOnly
                placeholder="Select a date"
              />
              <div className={`calendar-popup ${showCalendar ? 'show' : ''}`}>
                <div className="calendar-header">
                  <div className="calendar-nav">
                    <button 
                      className="calendar-nav-btn"
                      onClick={() => navigateMonth('prev')}
                    >
                      ←
                    </button>
                    <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button 
                      className="calendar-nav-btn"
                      onClick={() => navigateMonth('next')}
                    >
                      →
                    </button>
                  </div>
                </div>
                
                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                  ))}
                </div>
                
                <div className="calendar-days">
                  {generateCalendarDays()}
                </div>
              </div>
            </div>
            <div className="date-select-actions">
              <button 
                className="date-select-btn date-select-clear"
                onClick={() => {
                  setSelectedDate('');
                  setShowCalendar(false);
                }}
              >
                Clear Filter
              </button>
              <button 
                className="date-select-btn date-select-apply"
                onClick={() => {
                  setShowCalendar(false);
                }}
              >
                Apply Filter
              </button>
            </div>
          </div>
          
          {loadingAppointments ? (
            <div>Loading...</div>
          ) : appointments.length === 0 ? (
            <div>No appointments found.</div>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAppointments()
                  .filter((app: Appointment) => app.status !== 'cancelled')
                  .map((app: Appointment, index: number) => {
                    // Format date for display
                    const displayDate = new Date(app.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    
                    return (
                      <tr key={app.id}>
                        <td>{index + 1}</td>
                        <td>{app.patientName}</td>
                        <td>{app.phone || '-'}</td>
                        <td>{app.doctorName}</td>
                        <td>{app.reason}</td>
                        <td>{displayDate}</td>
                        <td>{app.time}</td>
                        <td className={`status-${app.status}`}>{app.status}</td>
                        <td>
                          {app.status === 'pending' ? (
                            actionDone && actionDone.id === app.id ? (
                              <span style={{ color: 'green', fontWeight: 600 }}>Done</span>
                            ) : (
                              <>
                                <button
                                  className="confirm-btn"
                                  onClick={() => handleUpdateAppointmentStatus(app.id!, 'confirmed')}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => handleUpdateAppointmentStatus(app.id!, 'cancelled')}
                                >
                                  Cancel
                                </button>
                              </>
                            )
                          ) : app.status === 'confirmed' ? (
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteAppointment(app.id!)}
                              style={{
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.75rem',
                                transition: 'background 0.2s, box-shadow 0.2s',
                                boxShadow: '0 2px 6px rgba(239,68,68,0.08)'
                              }}
                            >
                              Delete
                            </button>
                          ) : (
                            <span style={{ color: '#888' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
};

export default AdminPanel; 
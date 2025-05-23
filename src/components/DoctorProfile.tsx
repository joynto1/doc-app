import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './DoctorProfile.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
}

const DoctorProfile: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!doctorId) return;
        
        const doctorRef = doc(db, 'doctors', doctorId);
        const doctorSnap = await getDoc(doctorRef);
        
        if (doctorSnap.exists()) {
          setDoctor({ id: doctorSnap.id, ...doctorSnap.data() } as Doctor);
        } else {
          setError('Doctor not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctor details');
        setLoading(false);
        console.error('Error fetching doctor:', err);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleBookAppointment = () => {
    if (doctor) {
      navigate('/appointment', { 
        state: { 
          doctorName: doctor.name,
          doctorId: doctor.id
        } 
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading doctor profile...</div>;
  }

  if (error || !doctor) {
    return <div className="error">{error || 'Doctor not found'}</div>;
  }

  return (
    <div className="doctor-profile-container">
      <div className="doctor-profile-card">
        <div className="profile-header">
          <img src={doctor.image} alt={doctor.name} className="profile-image" />
          <div className="profile-info">
            <h1>{doctor.name}</h1>
            <p className="specialty">{doctor.specialty}</p>
            <div className="experience-badge">
              <span className="star">⭐</span>
              <span>{doctor.experience} Experience</span>
            </div>
            <div className="availability">
              <span className={`status-dot ${doctor.available ? 'available' : 'unavailable'}`}></span>
              <span>{doctor.available ? 'Available' : 'Unavailable'}</span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <section className="appointment-section">
            <h2>Book an Appointment</h2>
            <button
              className="book-appointment-btn"
              onClick={handleBookAppointment}
              disabled={!doctor.available}
            >
              Book Appointment
            </button>
          </section>

          <section className="about-section">
            <h2>About Dr. {doctor.name.split(' ')[1]}</h2>
            <p>
              Dr. {doctor.name} is a highly experienced {doctor.specialty.toLowerCase()} with {doctor.experience} of practice.
              Specializing in {doctor.specialty.toLowerCase()}, they provide comprehensive care and treatment
              for various conditions and concerns.
            </p>
          </section>

          <section className="services-section">
            <h2>Services Offered</h2>
            <ul className="services-list">
              {doctor.appointmentReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 
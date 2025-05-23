import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AllDoctors.css';
import { useAuth } from '../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
}

const AllDoctors: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const { currentUser } = useAuth();

  const specialties = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
  ];

  const [selectedSpecialty, setSelectedSpecialty] = useState(specialties[0]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const q = query(doctorsRef, where('specialty', '==', selectedSpecialty));
        const querySnapshot = await getDocs(q);
        
        const doctorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        
        setDoctors(doctorsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctors');
        setLoading(false);
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty]);

  const handleSpecialtyClick = (spec: string) => {
    setSelectedSpecialty(spec);
    setSelectedReason('');
  };

  const handleBookAppointment = (doctorName: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/appointment', { state: { doctorName } });
  };

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="all-doctors-container">
      <aside className="sidebar">
        <h3>Browse through the doctors specialist.</h3>
        <div className="specialty-list">
          {specialties.map((spec) => (
            <button
              key={spec}
              className={spec === selectedSpecialty ? 'specialty-btn active' : 'specialty-btn'}
              onClick={() => handleSpecialtyClick(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </aside>
      <section className="doctors-list">
        {doctors.length > 0 ? (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div className="doctor-card" key={doctor.id}>
                <img className="doctor-img" src={doctor.image} alt={doctor.name} />
                <div className="doctor-info">
                  <span className="status">
                    <span className="dot" /> {doctor.available ? 'Available' : 'Unavailable'}
                  </span>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialty}</p>
                  <p className="experience">Experience: {doctor.experience}</p>
                  <div className="button-group">
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(doctor.id)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="book-appointment-btn"
                      onClick={() => handleBookAppointment(doctor.name)}
                      disabled={!doctor.available || !currentUser}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
            No doctors found for this specialty.
          </div>
        )}
      </section>
    </div>
  );
};

export default AllDoctors; 
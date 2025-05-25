import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  const specialties = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Neurologist',
    'Gynecologist',
    'Obstetrician',
    // 'Ophthalmologist',
    // 'Orthopedist',
    // 'Pediatrician',
    // 'Psychiatrist',
    // 'Pulmonologist',
    // 'Rheumatologist',
    // 'Urologist',
    // 'ENT Specialist',
    // 'Dentist',
    // 'Surgeon',
    // 'Anesthesiologist',
    // 'Radiologist',
    // 'Pathologist'
  ];

const AllDoctors: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const { currentUser } = useAuth();

  // Read specialty from location.state if present
  const specialtyFromState = (location.state as any)?.specialty;
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(specialtyFromState || specialties[0]);

  useEffect(() => {
    // If specialtyFromState changes (e.g., user navigates from SpecialtySection), update selectedSpecialty
    if (specialtyFromState) {
      setSelectedSpecialty(specialtyFromState);
    }
    // eslint-disable-next-line
  }, [specialtyFromState]);

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

  const handleDoctorClick = (doctor: Doctor) => {
    navigate(`/doctor/${doctor.id}`);
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
        <h3>Specialist Doctors</h3>
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
          <div className="featuredSection-doctors-grid">
            {doctors.map((doctor) => (
              <div className="featured-doctor-card" onClick={() => handleDoctorClick(doctor)}  key={doctor.id}>
                <img className="doctor-img" src={doctor.image} alt={doctor.name} />
                <div className="featured-doctor-info">
                  <span className="all-doc-status">
                    <span className="dot" />{doctor.available ? 'Available' : 'Unavailable'}
                  </span>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialty}</p>
                  <p className="all_doc_experience">Experience: {doctor.experience}</p>
                  
                   
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
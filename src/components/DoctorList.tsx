import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './DoctorList.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
}

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsRef);
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        const available = doctorsList.filter(doc => doc.available);
        setDoctors(available);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSelectDoctor = (doctor: Doctor) => {
    navigate('/appointment', { 
      state: { 
        doctorName: doctor.name,
        doctorId: doctor.id,
        reason: 'General Consultation'
      } 
    });
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
    <div className="doctor-list-container">
      <h1>Select a Doctor for General Consultation</h1>
      <p className="subtitle">Choose from our available doctors below</p>
      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className="doctor-card"
            onClick={() => handleSelectDoctor(doctor)}
          >
            <img src={doctor.image} alt={doctor.name} className="doctor-image" />
            <div className="doctor-info">
              <h2>Dr. {doctor.name}</h2>
              <p className="specialty">{doctor.specialty}</p>
              <p className="experience">Experience: {doctor.experience}</p>
              <span className="status available">Available</span>
              <div className="button-group">
                <button 
                  className="select-doctor-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDoctor(doctor);
                  }}
                >
                  Select Doctor
                </button>
                <button 
                  className="view-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile(doctor.id);
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList; 
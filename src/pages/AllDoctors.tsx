import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './AllDoctors.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  experience: string;
  rating: number;
  // Add other doctor properties as needed
}

const AllDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Doctors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Your API call here
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const getFilteredDoctors = () => {
    if (selectedSpecialty === 'All Doctors') {
      return doctors;
    } else if (selectedSpecialty === 'All Specialists') {
      return doctors.filter(doctor => 
        doctor.specialty !== 'General Practitioner' && 
        doctor.specialty !== 'Family Doctor'
      );
    } else {
      return doctors.filter(doctor => doctor.specialty === selectedSpecialty);
    }
  };

  const getPageTitle = () => {
    if (selectedSpecialty === 'All Doctors') {
      return 'All Doctors';
    } else if (selectedSpecialty === 'All Specialists') {
      return 'All Specialists';
    } else {
      return `${selectedSpecialty}s`;
    }
  };

  return (
    <div className="all-doctors-container">
      <Sidebar
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={setSelectedSpecialty}
      />
      
      <div className="doctors-content">
        <h1 className="page-title">{getPageTitle()}</h1>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="doctors-grid">
            {getFilteredDoctors().map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <img src={doctor.image} alt={doctor.name} className="doctor-image" />
                <div className="doctor-info">
                  <h3 className="doctor-name">{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <p className="doctor-experience">{doctor.experience}</p>
                  <div className="doctor-rating">
                    {'★'.repeat(Math.floor(doctor.rating))}
                    {'☆'.repeat(5 - Math.floor(doctor.rating))}
                    <span>({doctor.rating})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllDoctors; 
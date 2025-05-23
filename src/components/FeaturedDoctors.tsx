import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './FeaturedDoctors.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  featured: boolean;
}

const FeaturedDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const q = query(doctorsRef, where('featured', '==', true));
        const querySnapshot = await getDocs(q);
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        setDoctors(doctorsList);
      } catch (err) {
        console.error('Error fetching featured doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDoctors();
  }, []);

  const handleDoctorClick = (doctor: Doctor) => {
    navigate(`/doctor/${doctor.id}`);
  };

  if (loading) {
    return <div className="loading">Loading featured doctors...</div>;
  }

  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="featured-doctors">
      <h2>Featured Doctors</h2>
      <div className="featured-doctors-grid">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="featured-doctor-card"
            onClick={() => handleDoctorClick(doctor)}
          >
            <div className="featured-badge">Featured</div>
            <img src={doctor.image} alt={doctor.name} />
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p className="specialty"> Specialty :  {doctor.specialty}</p>
              <p className="experience">   {doctor.experience} Experience ⭐⭐⭐</p>
              <span className={`availability ${doctor.available ? 'available' : 'unavailable'}`}>
                {doctor.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedDoctors; 
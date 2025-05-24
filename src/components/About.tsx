import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About Us</h1>
        <div className="about-sections">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              We are dedicated to providing accessible and efficient healthcare services
              through our innovative online platform. Our mission is to connect patients
              with qualified healthcare professionals seamlessly.
            </p>
          </section>
          
          <section className="about-section">
            <h2>Our Services</h2>
            <ul className="services-list">
              <li>Online Doctor Appointments</li>
              <li>24/7 Medical Consultation</li>
              <li>Specialized Healthcare Services</li>
              <li>Digital Health Records</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Why Choose Us</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>Easy Booking</h3>
                <p>Simple and quick appointment scheduling</p>
              </div>
              <div className="feature-item">
                <h3>Expert Doctors</h3>
                <p>Qualified and experienced healthcare professionals</p>
              </div>
              <div className="feature-item">
                <h3>Secure Platform</h3>
                <p>Your data is protected with us</p>
              </div>
              <div className="feature-item">
                <h3>24/7 Support</h3>
                <p>Round-the-clock customer assistance</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About; 
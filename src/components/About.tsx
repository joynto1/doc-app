import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-image">
        <img
          src="https://th.bing.com/th/id/OIP.rTI9LLFSxWCGhZODMBvIowHaE7?cb=iwc2&rs=1&pid=ImgDetMain"
          alt="Doctors"
        />
      </div>
      <div className="about-content">
        <h2>ABOUT <span>US</span></h2>
        <p>
          Welcome to Doctor Appointment Portal, your trusted partner in managing your healthcare needs conveniently and efficiently. At Doctor Appointment Portal, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
        </p>
        <p>
        Doctor Appointment Portal is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Doctor Appointment Portal is here to support you every step of the way.
        </p>
        <p className="about-vision-title"><strong>Our Vision</strong></p>
        <p>
          Our vision at Doctor Appointment Portal is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
        </p>
      </div>
    </div>
  );
};

export default About; 
import React from 'react';
import './Contact.css';

const Contact: React.FC = () => {
  return (
    <div className="contact-container">
      <div className="contact-image">
        <img
          src="https://th.bing.com/th/id/OIP.Y8ZneoN4D3vdZnPEJP3ScgHaH0?cb=iwc2&rs=1&pid=ImgDetMain"
          alt="Doctor with family"
        />
      </div>
      <div className="contact-content">
        <h2>CONTACT <span>US</span></h2>
        <div className="contact-info">
          <h3>OUR OFFICE</h3>
          <p>00000 Willms Station <br />Suite 000, Uttara,Dhaka, Bangladesh</p>
          <p>Tel: (000) 000-0000<br />Email: doctorappointmentportal@gmail.com</p>
        </div>
        <div className="contact-careers">
          <h3>CAREERS AT Doctor Appointment Portal</h3>
          <p>Learn more about our teams and job openings.</p>
          <button className="explore-jobs-btn">Explore Jobs</button>
        </div>
      </div>
    </div>
  );
};

export default Contact; 
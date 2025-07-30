import React from 'react';
import doctor_2 from '../assets/doctor_2.jpg'; // Replace with actual image

const AboutSection: React.FC = () => {
  return (
    <section className="py-10 px-6 bg-white" id="about">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
        {/* Left: Image */}
        <div className="w-full flex justify-center mt-10 mb-10">
          <img
            src={doctor_2}
            alt="Doctors discussing"
            className="rounded-[2rem] w-full max-w-md object-cover"
          />
        </div>
        {/* Right: Text Content */}
        <div className="text-center md:text-left">
          <h3 className="text-blue-600 font-semibold text-sm mb-2">About Us</h3>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug mb-6">
            Connect With Your Doctor
            <br />
            Book virtual appointments
            <br />
            or chat securely from home
          </h2>
          <p className="text-gray-600 text-base">
            Being in the healthcare sector, we consider it our paradigm duty to
            ensure Safety of our patients, effectiveness of our treatments,
            transparency in our practices, and absolute timely care.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

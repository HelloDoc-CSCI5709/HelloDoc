import React from 'react';
import doctor_3 from '../assets/doctor_3.png'; 
import { Link } from 'react-router-dom';


const HeroSection: React.FC = () => {
  return (
    <section className="bg-blue-50 py-8 px-6 md:grid md:grid-cols-2 items-end gap-10">
      <div className="flex items-center md:justify-start justify-center max-w-xl mx-auto text-center md:text-left md:ml-10 h-full">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Get Expert{" "}
            <span className="text-blue-600">Medical Consultation</span>
          </h2>
<p className="text-base text-gray-700 mb-6">
  Our doctors provide expert medical advice and consultation. Get in touch with our team to discuss
</p>
<Link
  to="/doctorregister"
  className="bg-blue-600 text-white px-5 py-2 rounded-md text-base hover:bg-blue-700"
>
  Get Started
</Link>
        </div>
      </div>

      <div className="w-full self-end">
        <img src={doctor_3} alt="Doctor" className="w-full max-w-md mx-auto" />
      </div>
    </section>
  );
};

export default HeroSection;

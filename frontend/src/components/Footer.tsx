import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-800 text-slate-200 pt-12 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-20 mb-10 text-left">


        {/* Logo & Description */}
        <div>
          <h3 className="text-xl font-bold mb-3">HelloDoc</h3>
          <p className="text-sm leading-relaxed">
            The ultimate destination for all of your medical needs. Experience modern telehealth and expert consultations from the comfort of your home.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-lg font-bold mb-3 ">Explore</h4>
          <ul className="text-sm space-y-2">
            <li><a href="#about" className="hover:text-blue-400">About us</a></li>
            <li><a href="#specialties" className="hover:text-blue-400">Our Departments</a></li>
            <li><a href="#services" className="hover:text-blue-400">Our Services</a></li>
            <li><a href="#testimonials" className="hover:text-blue-400">Reviews</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-bold mb-3">Contact</h4>
          <ul className="text-sm space-y-2">
            <li>1-902-494-2211</li>
            <li>dalhousie@doctor.com</li>
            <li>6385 South Street,<br />Halifax, NS</li>
          </ul>
        </div>

        {/* Placeholder to maintain 4-column layout */}
        <div></div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center text-sm border-t border-slate-700 pt-4">
        © Copyright 2024 HelloDoc. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;

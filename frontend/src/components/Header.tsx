import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/30 backdrop-blur-lg border-b border-blue-100/50 shadow-lg shadow-blue-100/20 px-6 py-4 flex justify-between items-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200/20 rounded-full blur-xl"></div>
        <div className="absolute -top-2 right-1/4 w-16 h-16 bg-indigo-200/25 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 bg-cyan-200/30 rounded-full blur-md"></div>
      </div>

      {/* Logo with enhanced styling */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold cursor-pointer">
          <span className="text-blue-600">Hello</span>
          <span className="text-black">Doc</span>
        </h1>
        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
      </div>

      {/* Navigation with enhanced styling */}
      <nav className="relative z-10 space-x-6 text-sm font-medium">
        <a
          href="#about"
          className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative group py-2 px-1"
        >
          About Us
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
        </a>
        <a
          href="#specialties"
          className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative group py-2 px-1"
        >
          Departments
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
        </a>
        <a
          href="#services"
          className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative group py-2 px-1"
        >
          Services
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
        </a>

        <a
          href="#testimonials"
          className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative group py-2 px-1"
        >
          Reviews
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
        </a>

         <a
          href="#contact"
          className="text-gray-700 hover:text-blue-600 transition-all duration-300 relative group py-2 px-1"
        >
          Contact
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
        </a>
        <a
          href="/login"
          className="text-white bg-blue-600 hover:bg-blue-700 font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200/30"
        >
          Login
        </a>
      </nav>
    </header>
  );
};

export default Header;
import React from 'react';
import { Video, CalendarCheck, Bell, FileText, MessageSquareHeart } from 'lucide-react';

const services = [
  {
    title: 'Appointment Booking',
    description: 'Easily schedule doctor visits and follow-ups online with real-time availability.',
    icon: <CalendarCheck className="w-8 h-8 text-white" />,
  },
  {
    title: 'Video Consultations',
    description: 'Connect with doctors through secure, high-quality video calls from any device.',
    icon: <Video className="w-8 h-8 text-white" />,
  },
  {
    title: 'Reminders',
    description: 'Get automated email and SMS reminders for your upcoming appointments.',
    icon: <Bell className="w-8 h-8 text-white" />,
  },
  {
    title: 'Digital Health Records',
    description: 'Store and access your health history, prescriptions, and lab results securely online.',
    icon: <FileText className="w-8 h-8 text-white" />,
  },
  {
    title: 'Secure Chat',
    description: 'Chat privately with healthcare professionals to ask questions and receive guidance.',
    icon: <MessageSquareHeart className="w-8 h-8 text-white" />,
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-white" id="services">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold bg-blue-600 bg-clip-text text-transparent mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Explore the core healthcare services offered by HelloDoc to make your digital medical journey easier and faster.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:-translate-y-2 hover:scale-105 transition-transform duration-300 text-left"
            >
              <div className="w-14 h-14 mb-4 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

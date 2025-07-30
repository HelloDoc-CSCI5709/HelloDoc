import React from 'react';
import SpecialtyCard from './SpecialtyCard';

const specialties = [
  { title: 'Cardiology', description: 'Heart and blood vessel care.' },
  { title: 'Pediatrics', description: 'Healthcare for children and infants.' },
  { title: 'Psychiatry', description: 'Mental health and behavioral therapy.' },
  { title: 'Orthopedics', description: 'Bone, joint, and muscle treatments.' },
  { title: 'Ophthalmology', description: 'Eye exams and vision correction.' },
  { title: 'Radiology', description: 'Diagnostic imaging services.' },
  { title: 'ENT', description: 'Ear, nose, and throat care.' },
  { title: 'Neurology', description: 'Nervous system and brain treatment.' },
];

const SpecialtiesSection: React.FC = () => {
  return (
    <section
      className="py-20 px-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
      id="specialties"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-16 w-28 h-28 bg-indigo-200 rounded-full opacity-25 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-cyan-200 rounded-full opacity-30 blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold bg-blue-600 bg-clip-text text-transparent mb-3">
            Our Specialties
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-base max-w-2xl mx-auto">
            Comprehensive healthcare services across multiple medical specializations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {specialties.map((s, index) => (
            <SpecialtyCard key={index} title={s.title} description={s.description} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;

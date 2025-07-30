import React from 'react';
import {
  Heart,
  Baby,
  Brain,
  Bone,
  Eye,
  Monitor,
  Ear,
  Zap,
} from 'lucide-react';

interface SpecialtyCardProps {
  title: string;
  description: string;
}

const getSpecialtyIcon = (specialty: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    Cardiology: <Heart className="w-8 h-8 text-white" />,
    Pediatrics: <Baby className="w-8 h-8 text-white" />,
    Psychiatry: <Brain className="w-8 h-8 text-white" />,
    Orthopedics: <Bone className="w-8 h-8 text-white" />,
    Ophthalmology: <Eye className="w-8 h-8 text-white" />,
    Radiology: <Monitor className="w-8 h-8 text-white" />,
    ENT: <Ear className="w-8 h-8 text-white" />,
    Neurology: <Zap className="w-8 h-8 text-white" />,
  };

  return iconMap[specialty] || <Heart className="w-8 h-8 text-white" />;
};

const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ title, description }) => {
  return (
    <div className="group relative bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center border border-white/20 hover:-translate-y-1 hover:scale-[1.02]">
      {/* Hover background */}
      <div className="absolute inset-0  rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Icon */}
      <div className="relative z-10 w-14 h-14 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
        {getSpecialtyIcon(title)}
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="relative z-10 text-sm text-gray-600 group-hover:text-gray-800 transition duration-300 mb-2 px-2">
        {description}
      </p>

      {/* Line */}
      <div className="relative z-10 w-12 h-1 bg-gray-200 group-hover:bg-blue-300 rounded-full mx-auto transition-colors duration-300"></div>
    </div>
  );
};

export default SpecialtyCard;

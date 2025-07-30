import React from 'react';
import { Star, Calendar, MapPin, Award } from 'lucide-react';

export interface Doctor {
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  rating: string;
  reviews: number;
  nextAvailable: string;
  image: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onSchedule: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSchedule }) => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-lg bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-blue-200">
      {/* Doctor Info Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img 
            src={doctor.image} 
            alt={doctor.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-300" 
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
          <p className="text-sm font-medium text-blue-600 mb-1">{doctor.specialty}</p>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3 h-3" />
            <p className="text-sm">{doctor.clinic}</p>
          </div>
        </div>
      </div>

      {/* Experience Badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
          <Award className="w-3 h-3" />
          <span className="text-sm font-medium">{doctor.experience}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">{doctor.rating}</span>
        </div>
        <span className="text-sm text-gray-500">({doctor.reviews} Reviews)</span>
      </div>

      {/* Next Available */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-lg border border-green-100">
        <Calendar className="w-4 h-4 text-green-600" />
        <div>
          <p className="text-xs text-green-700 font-medium">Next Available</p>
          <p className="text-sm font-semibold text-green-800">{doctor.nextAvailable}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <a 
          href="/doctor-profile" 
          className="flex-1 text-center py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 text-sm font-medium"
        >
          View Profile
        </a>
        <button
          onClick={() => onSchedule(doctor)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Schedule Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
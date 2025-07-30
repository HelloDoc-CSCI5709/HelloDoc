import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Michael',
    role: 'Patient',
    text: 'Amazing team and amazing treatment from the best doctor in the world',
  },
  {
    name: 'Sarah',
    role: 'Patient',
    text: 'The doctors are very supportive and the system is easy to use.',
  },
  {
    name: 'David',
    role: 'Patient',
    text: 'Quick appointments and helpful staff. Great platform!',
  },
  {
    name: 'Emma',
    role: 'Patient',
    text: 'Highly recommended for remote consultations. Very professional.',
  },
  {
    name: 'James',
    role: 'Patient',
    text: 'Consulted my dermatologist in minutes. Seamless experience!',
  },
  {
    name: 'Alicia',
    role: 'Patient',
    text: 'Booking an appointment took less than a minute. Super convenient!',
  },
  {
    name: 'Ryan',
    role: 'Patient',
    text: 'The consultation was smooth and the doctor was really attentive.',
  },
  {
    name: 'Carlos',
    role: 'Patient',
    text: 'They sent me reminders before my appointment. Very organized!',
  },
];

const ITEMS_PER_PAGE = 4;

const TestimonialsSection: React.FC = () => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));

  const visibleTestimonials = testimonials.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <section className="bg-blue-50 py-20 px-6" id="testimonials">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
            Read feedback about our <br />
            <span className="text-blue-700">Services and wonderful team!</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            We take care of our patients just like a family member. Read the testimonials from our patients.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-end mb-6 gap-3">
          <button
            className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
            onClick={handlePrev}
            disabled={page === 0}
          >
            <ChevronLeft size={16} className="mx-auto" />
          </button>
          <button
            className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
            onClick={handleNext}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight size={16} className="mx-auto" />
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleTestimonials.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 text-left"
            >
              <Quote className="w-6 h-6 text-blue-500 mb-4" />
              <p className="text-sm text-gray-700 mb-4">{review.text}</p>
              <div>
                <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                <p className="text-xs text-gray-500">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

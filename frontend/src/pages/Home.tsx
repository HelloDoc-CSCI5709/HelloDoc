import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import SpecialtiesSection from '../components/SpecialtiesSection';
import ServicesSection from '../components/ServicesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <AboutSection />
      <SpecialtiesSection />
      <ServicesSection />
      <TestimonialsSection />
      <Footer />
    </>
  );
};

export default Home;
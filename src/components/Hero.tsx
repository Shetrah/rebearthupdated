import React from 'react';
import Carousel from './Carousel';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <Carousel />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      
      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Cultivating Tomorrow's
          <span className="text-green-400"> Agriculture</span>
        </h1>
        <p className="text-lg sm:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Rebearth Solutions provides innovative agricultural technologies and sustainable farming solutions 
          to help farmers maximize their yield and protect our environment.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Products
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Get In Touch
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
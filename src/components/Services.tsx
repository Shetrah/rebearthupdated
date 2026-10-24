import React from 'react';
import { Users, Leaf, BarChart3, Wrench, GraduationCap, Phone } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      name: 'Agricultural Consulting',
      description: 'Expert advice on crop management, soil health, and sustainable farming practices tailored to your specific needs.',
      icon: <Users className="h-8 w-8" />
    },
    {
      id: 2,
      name: 'Crop Health Analysis',
      description: 'Comprehensive crop assessment using advanced diagnostic tools to identify issues and optimize growth.',
      icon: <Leaf className="h-8 w-8" />
    },
    {
      id: 3,
      name: 'Yield Optimization',
      description: 'Data-driven strategies to maximize your crop yields while minimizing resource usage and environmental impact.',
      icon: <BarChart3 className="h-8 w-8" />
    },
    {
      id: 4,
      name: 'Certified Seed Provision',
      description: 'Professional maintenance and repair services for all types of agricultural equipment and machinery.',
      icon: <Wrench className="h-8 w-8" />
    },
    {
      id: 5,
      name: 'Training Programs',
      description: 'Educational workshops and training sessions on modern farming techniques and sustainable agriculture.',
      icon: <GraduationCap className="h-8 w-8" />
    },
    {
      id: 6,
      name: '24/7 Support',
      description: 'Round-the-clock technical support and emergency assistance for all your agricultural needs.',
      icon: <Phone className="h-8 w-8" />
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive agricultural services designed to support your farming operations 
            from planning to harvest, ensuring optimal results every season.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {service.name}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 flex items-center space-x-2 group">
                <span>Learn More</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-navy-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Farm?
          </h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Get in touch with our agricultural experts and discover how our services 
            can help you achieve your farming goals.
          </p>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
          >
            Contact Us Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
import React from 'react';
import { Users, Leaf, BarChart3, Wrench, GraduationCap, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      name: 'Agricultural Consulting',
      description: 'Expert advice on crop management, soil health, and sustainable farming practices tailored to your specific needs.',
      icon: <Users className="h-8 w-8" />,
      features: ['Crop rotation planning', 'Soil analysis', 'Pest management', 'Yield optimization'],
    },
    {
      id: 2,
      name: 'Crop Health Analysis',
      description: 'Comprehensive crop assessment using advanced diagnostic tools to identify issues and optimize growth.',
      icon: <Leaf className="h-8 w-8" />,
      features: ['Disease identification', 'Nutrient deficiency analysis', 'Growth monitoring', 'Treatment recommendations'],
    },
    {
      id: 3,
      name: 'Yield Optimization',
      description: 'Data-driven strategies to maximize your crop yields while minimizing resource usage and environmental impact.',
      icon: <BarChart3 className="h-8 w-8" />,
      features: ['Performance analytics', 'Resource optimization', 'Predictive modeling', 'ROI analysis'],
    },
    {
      id: 4,
      name: 'Green House Management',
      description: 'provide reliable greenhouse maintenance services to help farmers achieve maximum yields. Our solutions focus on climate control, pest management, irrigation efficiency, and soil health, ensuring your crops thrive in a clean, productive environment. Trust us for sustainable, cost-effective greenhouse care.',
      icon: <Wrench className="h-8 w-8" />,
      features: ['Site identification', 'Connect to Suppliers', 'Setup', 'Piping', 'Maintaining'],
    },
    {
      id: 5,
      name: 'Training Programs',
      description: 'Educational workshops and training sessions on modern farming techniques and sustainable agriculture.',
      
      icon: <GraduationCap className="h-8 w-8" />,
      features: ['Hands-on workshops', 'Online courses', 'Certification programs', 'Custom training'],
    },
    {
      id: 6,
      name: '24/7 Support',
      description: 'Round-the-clock technical support and emergency assistance for all your agricultural needs.',
      icon: <Phone className="h-8 w-8" />,
      features: ['Emergency hotline', 'Remote diagnostics', 'On-site support', 'Priority response'],
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Consultation',
      description: 'We start with a comprehensive consultation to understand your specific needs and challenges.'
    },
    {
      step: '02',
      title: 'Assessment',
      description: 'Our experts conduct a thorough assessment of your current operations and identify opportunities.'
    },
    {
      step: '03',
      title: 'Solution Design',
      description: 'We design customized solutions tailored to your unique requirements and budget.'
    },
    {
      step: '04',
      title: 'Implementation',
      description: 'Our team implements the solutions with minimal disruption to your operations.'
    },
    {
      step: '05',
      title: 'Support',
      description: 'We provide ongoing support and monitoring to ensure optimal performance and results.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Comprehensive agricultural services designed to support your farming operations 
              from planning to harvest, ensuring optimal results every season.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
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
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-end">
                  <button className="text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 flex items-center space-x-2 group">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Service Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We follow a proven methodology to ensure that every service we provide 
              delivers maximum value and results for your agricultural operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-200 transform -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Our Services?
              </h2>
              <div className="space-y-6">
                {[
                  'Increase crop yields by up to 35%',
                  'Reduce operational costs by 20-30%',
                  'Improve soil health and sustainability',
                  'Access to cutting-edge agricultural technology',
                  'Expert guidance from certified professionals',
                  'Customized solutions for your specific needs'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-96">
              <img
                src="https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg"
                alt="Agricultural services"
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-lg text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Get in touch with our agricultural experts and discover how our services 
            can help you achieve your farming goals.
          </p>
          <Link
            to="/contact"
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Contact Us Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
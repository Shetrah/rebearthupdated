import React from 'react';
import { Leaf, Target, Award, Users } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: 'Sustainable Solutions',
      description: 'Eco-friendly agricultural practices that protect our environment while maximizing productivity.'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Precision Agriculture',
      description: 'Advanced technology and data-driven approaches to optimize crop yields and resource usage.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Assurance',
      description: 'Premium products and services backed by rigorous testing and continuous improvement.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Expert Support',
      description: 'Dedicated team of agricultural specialists providing ongoing guidance and technical support.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About Rebearth Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are passionate about revolutionizing agriculture through innovative solutions that 
            benefit both farmers and the environment. Our commitment to sustainability and excellence 
            drives everything we do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-green-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Our Mission
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                To empower farmers with cutting-edge agricultural solutions that increase productivity, 
                reduce environmental impact, and create sustainable food systems for future generations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through innovation, research, and collaboration, we're building a more sustainable 
                and productive agricultural future.
              </p>
            </div>
            <div className="h-64 lg:h-auto">
              <img
                src="https://images.pexels.com/photos/32585381/pexels-photo-32585381.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                alt="Modern farming equipment"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
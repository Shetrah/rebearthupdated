import React from 'react';
import { Leaf, Target, Award, Users, History, Globe, Heart } from 'lucide-react';

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

  const values = [
    {
      icon: <Heart className="h-12 w-12" />,
      title: 'Passion for Agriculture',
      description: 'We are deeply committed to advancing agricultural practices and supporting smallholder farmers all over the region.'
    },
    {
      icon: <Globe className="h-12 w-12" />,
      title: 'Environmental Stewardship',
      description: 'Protecting our planet through sustainable farming solutions and eco-friendly practices.'
    },
    {
      icon: <History className="h-12 w-12" />,
      title: 'Innovation Legacy',
      description: 'Building on decades of agricultural expertise to create cutting-edge solutions for tomorrow.'
    }
  ];

  return (
    <div className="min-h-screen bg-pattern">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-green-600 to-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-in-up">
              About Rebearth Solutions
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed animate-slide-in-left">
              Pioneering the future of agriculture through innovation, sustainability, and unwavering commitment to farmers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Our mission is to provide an accessible and sustainable approach to health by promoting the consumption of natural foods. We believe that everyone deserves the right to quality agricultural products, making healthy eating a fundamental right rather than a luxury. By fostering partnerships within the agricultural community, we aim to create a system that prioritizes affordability and nutrition, ensuring that all individuals can benefit from the power of wholesome food for their well-being.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Through innovation, research, and collaboration, we're building a more sustainable 
                and productive agricultural future that benefits both farmers and the environment.
              </p>
            </div>
            <div className="h-96 animate-slide-in-right">
              <img
                src="https://images.pexels.com/photos/32585381/pexels-photo-32585381.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                alt="Modern farming equipment"
                className="w-full h-full object-cover rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              What Sets Us Apart
            </h2>
            <div className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Proven Trust</h3>
                <p>Rebearth is trusted by farmers across the region for delivering consistent results.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Innovative Technology</h3>
                <p>Unlike others, we use ionic charge harmonization instead of adding chemicals, ensuring natural, sustainable growth.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-2">World-class Expertise</h3>
                <p>Our team combines global knowledge with local understanding to support farmers at every step.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Time Efficiency</h3>
                <p>Our solutions work faster, helping plants recover and thrive even under stress.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-500 mb-2">Maximum Productivity</h3>
                <p>We help farmers achieve higher yields with less input, ensuring better returns and healthier crops.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 card-hover"
              >
                <div className="text-green-600 mb-4 icon-hover">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-hover">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These fundamental principles guide our decisions and shape our approach 
              to serving the agricultural community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="text-green-600 mb-6 flex justify-center icon-hover">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-hover">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="h-96 animate-slide-in-left">
              <img
                src="https://images.pexels.com/photos/32585404/pexels-photo-32585404.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                alt="Agricultural research"
                className="w-full h-full object-cover rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              />
            </div>
            <div className="animate-slide-in-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                At Rebearth Solutions, we are motivated by a profound conviction in the inherent order of nature and the limitless potential of humanity to coexist harmoniously with it. We are geared in restoring balance not only in the soil but also within our lives, fostering a holistic approach that ultimately contributes to a more balanced and sustainable world. We envision a future where individuals, communities, and ecosystems thrive together, guided by principles of respect, stewardship, and interconnectedness. Through our efforts, we aim to inspire a collective movement towards environmental harmony and personal well-being.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Our Expert Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet the dedicated professionals who make Rebearth Solutions a leader 
              in agricultural innovation and customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: 'Agricultural Scientists', count: '3+', description: 'PhD-level researchers developing cutting-edge solutions' },
              { role: 'Field Specialists', count: '10+', description: 'On-ground experts providing direct farmer support' },
              { role: 'Technical Engineers', count: '2+', description: 'Innovation specialists creating next-gen equipment' },
              { role: 'Customer Success', count: '13+', description: 'Dedicated support team ensuring client satisfaction' }
            ].map((team, index) => (
              <div key={index} className="text-center bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold text-green-600 mb-2 hover:scale-110 transition-transform duration-300">{team.count}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{team.role}</h3>
                <p className="text-gray-600 leading-relaxed">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { CustomerReview } from '../types';

const CustomerReviews: React.FC = () => {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews: CustomerReview[] = [
    {
      id: 1,
      name: 'John Kamau',
      rating: 5,
      comment: 'Rebearth Pro has transformed my tomato farm. The yield increased by 40% and the plants are much healthier. Highly recommend!',
      date: '2024-01-15',
      location: 'Nakuru, Kenya'
    },
    {
      id: 2,
      name: 'Mary Wanjiku',
      rating: 5,
      comment: 'The customer service is excellent and the products really work. My vegetables have never looked better!',
      date: '2024-01-20',
      location: 'Kiambu, Kenya'
    },
    {
      id: 3,
      name: 'Peter Ochieng',
      rating: 4,
      comment: 'Great products and fast delivery. The Rebearth 5.0 helped my crops recover from drought stress quickly.',
      date: '2024-01-25',
      location: 'Kisumu, Kenya'
    },
    {
      id: 4,
      name: 'Grace Muthoni',
      rating: 5,
      comment: 'The monkey repellant works perfectly! No more crop damage and it\'s completely safe for the environment.',
      date: '2024-02-01',
      location: 'Nyeri, Kenya'
    },
    {
      id: 5,
      name: 'Samuel Kiprop',
      rating: 5,
      comment: 'Professional team and quality products. My greenhouse productivity has doubled since using their solutions.',
      date: '2024-02-05',
      location: 'Eldoret, Kenya'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-navy-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what farmers across Kenya are saying about our products and services.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Review Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            <Quote className="absolute top-6 right-6 h-12 w-12 text-green-100" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="flex justify-center mb-4">
                {renderStars(reviews[currentReview].rating)}
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{reviews[currentReview].comment}"
              </p>
              
              <div>
                <h4 className="font-bold text-gray-900 text-xl">
                  {reviews[currentReview].name}
                </h4>
                <p className="text-green-600 font-medium">
                  {reviews[currentReview].location}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(reviews[currentReview].date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevReview}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 hover:text-green-600 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextReview}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 hover:text-green-600 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentReview
                    ? 'bg-green-600 scale-125'
                    : 'bg-gray-300 hover:bg-green-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Average Rating</div>
            <div className="flex justify-center mt-2">
              {renderStars(5)}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-green-600 mb-2">2,500+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
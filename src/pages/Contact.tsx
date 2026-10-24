import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ExternalLink, X } from 'lucide-react';
import Swal from 'sweetalert2'

const Contact: React.FC = () => {
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [counters, setCounters] = useState({
    reviews: 0,
    products: 0,
    services: 0
  });

  const targetValues = {
    reviews: 2500,
    products: 150,
    services: 25
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    const incrementCounters = () => {
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounters({
          reviews: Math.floor(targetValues.reviews * progress),
          products: Math.floor(targetValues.products * progress),
          services: Math.floor(targetValues.services * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targetValues);
        }
      }, stepTime);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          incrementCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const counterElement = document.getElementById('contact-counters');
    if (counterElement) {
      observer.observe(counterElement);
    }

    return () => observer.disconnect();
  }, []);



  const handleEmailClick = () => {
    window.open('mailto:info@rebearthsolutions.co.ke', '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:+254706169776', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/254110724091', '_blank');
  };

  const handleMapClick = () => {
    setShowMap(true);
  };

  const contactInfo: {icon: JSX.Element, title: string, details: string, description: string, action: () => void | null}[] = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Us',
      details: 'info@rebearthsolutions.co.ke',
      description: 'Send us an email anytime',
      action: handleEmailClick
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Call Us',
      details: 'Calls - +254706169776 / WhatsApp - +254110724091',
      description: 'Mon-Fri from 8am to 5pm',
      action: handlePhoneClick
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Visit Us',
      details: 'The office is opposite court, kenyan women building - Kisumu',
      description: 'Come say hello at our office',
      action: handleMapClick
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Working Hours',
      details: 'Mon - Fri: 8:00 AM - 5:00 PM',
      description: 'Saturday: 9:00 AM - 2:00 PM',
      action: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our agricultural experts. We're here to help you transform 
              your farming operations with innovative solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cardsnpm */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                onClick={info.action}
                className={`bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  info.action !== null  ? 'cursor-pointer hover:bg-green-50' : ''
                }`}
              >
                <div className="text-green-600 mb-4 flex justify-center">
                  {info.icon}
                  {info.action !== (null) && (
                    <ExternalLink className="h-4 w-4 ml-1 opacity-60" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-900 font-medium mb-1">
                  {info.details}
                </p>
                <p className="text-gray-600 text-sm">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Contact</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleWhatsAppClick}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <span>WhatsApp</span>
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={handlePhoneClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <span>Call Now</span>
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={handleEmailClick}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <span>Email</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              
<ContactForm />
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Visit Our Office
                </h3>
                <p className="text-gray-600 mb-6">
                  We'd love to meet you in person. Our office is located opposite court kenyan women building in Kisumu,  
                  easily accessible and equipped with modern facilities to serve you better.
                </p>
                <div 
                  className="bg-gray-100 h-64 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-300"
                  onClick={handleMapClick}
                >
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-gray-600 font-semibold">Click to View Interactive Map</p>
                    <p className="text-sm text-gray-500">72-49305, Kisumu, Kenya</p>
                    <ExternalLink className="h-4 w-4 text-green-600 mx-auto mt-2" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Response Guarantee
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Email responses within 2 hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Phone support during business hours</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Emergency support available 24/7</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">On-site visits within 48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="contact-counters" className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {counters.reviews.toLocaleString()}+
              </div>
              <div className="text-lg font-semibold opacity-90">Happy Customers</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {counters.products}+
              </div>
              <div className="text-lg font-semibold opacity-90">Quality Products</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {counters.services}+
              </div>
              <div className="text-lg font-semibold opacity-90">Expert Services</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Our Location</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7571234567!2d34.7617!3d-0.0917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMDUnMzAuMSJTIDM0wrA0NSczOC4xIkU!5e0!3m2!1sen!2ske!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
              <div className="mt-4 text-center">
                <p className="text-gray-600">72-49305, Kisumu, Kenya</p>
                <p className="text-sm text-gray-500">Opposite court, Kenyan women building</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ContactForm component moved here for use in Contact component
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [result, setResult] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResult("Sending...");

    const data = new FormData();
    data.append("access_key", "a240f66c-aaf4-478f-bcec-89e05c8561e4"); // Replace with your actual key
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("subject", formData.subject);
    data.append("message", formData.message);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: data
    });

    const resultData = await response.json();

    if (resultData.success) {
      setResult("Form submitted successfully!");
      Swal.fire({
        title: "Thank you!",
        text: "We have received your message and will get back to you shortly.",
        icon: "success"
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setTimeout(() => {
      }, 2000);
    } else {
      setResult("Something went wrong. Please try again.");
      Swal.fire({
        title: "Oops!",
        text: "Something went wrong. Please try again.",
        icon: "error"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200"
            placeholder="+254 xxx xxx xxx"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200"
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="products">Product Information</option>
            <option value="services">Service Request</option>
            <option value="support">Technical Support</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          value={formData.message}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors duration-200"
          placeholder="Type your message here..."
          rows={5}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200"
      >
        <Send className="h-5 w-5" />
        <span>Send Message</span>
      </button>
      <p className="text-center text-sm text-gray-600 mt-4">{result}</p>
    </form>
  );
};

export default Contact;

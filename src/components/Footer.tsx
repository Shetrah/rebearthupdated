import React, { useState, useEffect } from 'react';
import { Facebook, MessageCircle, Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
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
    const duration = 2000; // 2 seconds
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

    // Start animation when component mounts
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          incrementCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById('footer-counters');
    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      icon: <Facebook className="h-5 w-5" />,
      hoverColor: 'hover:bg-blue-600'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/254110724091',
      icon: <MessageCircle className="h-5 w-5" />,
      hoverColor: 'hover:bg-green-600'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/walter-wasaga-120a2a1b9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      icon: <Linkedin className="h-5 w-5" />,
      hoverColor: 'hover:bg-blue-700'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/rebearth_ltd?igsh=MTk2MWZiNno3ZWxtYQ==',
      icon: <Instagram className="h-5 w-5" />,
      hoverColor: 'hover:bg-pink-600'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@reb_earthsolutiins?_t=ZM-8xFLUmjG3aa&_r=1',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      hoverColor: 'hover:bg-black'
    },
    {
      name: 'Twitter',
      url: 'https://x.com/ObadoWalter?s=09',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      hoverColor: 'hover:bg-gray-800'
    }
  ];

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      {/* Counters Section */}
      <div id="footer-counters" className="bg-gradient-to-r from-green-600 to-navy-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 transform group-hover:scale-125 transition-all duration-500 group-hover:text-yellow-300">
                {counters.reviews.toLocaleString()}+
              </div>
              <div className="text-lg font-semibold opacity-90 group-hover:opacity-100 transition-all duration-300">Happy Customers</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 transform group-hover:scale-125 transition-all duration-500 group-hover:text-yellow-300">
                {counters.products}+
              </div>
              <div className="text-lg font-semibold opacity-90 group-hover:opacity-100 transition-all duration-300">Quality Products</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 transform group-hover:scale-125 transition-all duration-500 group-hover:text-yellow-300">
                {counters.services}+
              </div>
              <div className="text-lg font-semibold opacity-90 group-hover:opacity-100 transition-all duration-300">Expert Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <img 
                    src="/WhatsApp Image 2025-06-11 at 3.06.35 PM.jpeg" 
                    alt="Rebearth Solutions Logo" 
                    className="h-12 w-12 object-contain group-hover:scale-110 transition-all duration-500 group-hover:rotate-6"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-500">Rebearth</span>
                  <span className="text-xs font-medium text-green-400 group-hover:text-white transition-colors duration-500">SOLUTIONS</span>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md hover:text-white transition-colors duration-300">
                Leading provider of innovative agricultural solutions, helping farmers worldwide 
                achieve sustainable growth and maximize their potential through cutting-edge technology 
                and expert guidance.
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`bg-gray-800 p-3 rounded-full transition-all duration-500 transform hover:scale-125 hover:-translate-y-2 hover:shadow-lg ${social.hoverColor}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-green-400">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { name: 'About Us', path: '/about' },
                  { name: 'Products', path: '/products' },
                  { name: 'Services', path: '/services' },
                  { name: 'Contact', path: '/contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-gray-300 hover:text-green-400 transition-all duration-500 hover:translate-x-2 hover:scale-105 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-green-400">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 group hover:translate-x-2 transition-all duration-300">
                  <Mail className="h-5 w-5 text-green-400 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">info@rebearthsolutions.co.ke</span>
                </div>
                <div className="flex items-center space-x-3 group hover:translate-x-2 transition-all duration-300">
                  <Phone className="h-5 w-5 text-green-400 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">+254706169776 / +254110724091</span>
                </div>
                <div className="flex items-center space-x-3 group hover:translate-x-2 transition-all duration-300">
                  <MapPin className="h-5 w-5 text-green-400 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">72-49305, Kisumu, Kenya</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              © 2024 Rebearth Solutions. All rights reserved. | Cultivating the future of agriculture.
            </p>
            <p className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
              Designed & Published by: shetrahgrafix.co.ke
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
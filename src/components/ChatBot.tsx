import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

declare global {
  interface Window {
    Tawk_API?: any;
  }
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);

    if (typeof window !== "undefined" && window.Tawk_API && isNameSet) {
      if (!isOpen) {
        window.Tawk_API.maximize();
      } else {
        window.Tawk_API.minimize();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsNameSet(true);

    // Set visitor name in Tawk
    if (window.Tawk_API) {
      window.Tawk_API.setAttributes({ name: name }, function (error: any) {
        if (!error) {
          window.Tawk_API.showWidget();
          window.Tawk_API.maximize();
        }
      });
    }
  };

  useEffect(() => {
    if (!document.getElementById('tawk-script')) {
      const s1 = document.createElement("script");
      s1.src = 'https://embed.tawk.to/68652fe8be8a1b1910b7fb6f/1iv5k699v';
      s1.async = true;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s1.id = 'tawk-script';
      document.body.appendChild(s1);

      s1.onload = () => {
        if (window.Tawk_API) {
          window.Tawk_API.onLoad = function () {
            window.Tawk_API.hideWidget();
          };
        }
      };
    }
  }, []);

  return (
    <>
      {/* Chat Button on Bottom Right */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-125 hover:-translate-y-2 z-50 animate-pulse-slow"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Name Prompt Popup on Bottom Right */}
      {isOpen && !isNameSet && (
        <div className="fixed bottom-6 left-6 bg-gradient-to-r from-navy-800 to-green-600 hover:from-navy-700 hover:to-green-500 text-white p-4 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-125 hover:-translate-y-2 z-50 group animate-glow">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Welcome to Rebearth Chat</h3>
          <p className="text-sm text-gray-600 mb-4">Please enter your name to begin:</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 mb-3"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white py-2 rounded-lg transition-all duration-300"
            >
              Start Chat
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;

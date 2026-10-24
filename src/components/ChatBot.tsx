import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

declare global { interface Window { Tawk_API?: any; } }

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [tawkLoaded, setTawkLoaded] = useState(false);
  const [tawkUnavailable, setTawkUnavailable] = useState(false);
  const visitorName = useRef('');

  useEffect(() => {
    const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID || '68652fe8be8a1b1910b7fb6f';
    const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID || '1iv5k699v';
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = () => {
      setTawkLoaded(true);
      window.Tawk_API?.hideWidget?.();
      if (visitorName.current) {
        window.Tawk_API?.setAttributes?.({ name: visitorName.current }, () => {
          window.Tawk_API?.showWidget?.();
          window.Tawk_API?.maximize?.();
        });
      }
    };
    if (!document.getElementById('tawk-script')) {
      const script = document.createElement('script');
      script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
      script.async = true;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      script.id = 'tawk-script';
      script.onerror = () => setTawkUnavailable(true);
      document.body.appendChild(script);
    } else if (typeof window.Tawk_API?.showWidget === 'function') setTawkLoaded(true);
  }, []);

  const toggleChat = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (tawkLoaded && isNameSet) {
      if (nextOpen) window.Tawk_API?.maximize?.();
      else window.Tawk_API?.minimize?.();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    visitorName.current = name.trim();
    setIsNameSet(true);
    if (tawkLoaded) window.Tawk_API?.setAttributes?.({ name: visitorName.current }, () => {
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.maximize?.();
    });
  };

  return <>
    <button onClick={toggleChat} aria-label={isOpen ? 'Close chat' : 'Open chat'} className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-green-600 to-green-800 p-4 text-white shadow-2xl transition hover:scale-110">
      {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
    </button>
    {isOpen && !isNameSet && <div className="fixed bottom-24 right-6 z-50 w-[min(22rem,calc(100vw-3rem))] rounded-2xl bg-white p-5 shadow-2xl">
      <h3 className="text-lg font-semibold text-gray-900">Welcome to Rebearth Chat</h3>
      <p className="mb-4 mt-1 text-sm text-gray-600">Enter your name to start a conversation.</p>
      <form onSubmit={handleSubmit}>
        <input required type="text" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
        <button type="submit" className="w-full rounded-lg bg-green-700 py-2 font-semibold text-white hover:bg-green-800">Start chat</button>
      </form>
      {tawkUnavailable && <p className="mt-3 text-sm text-red-700">Chat could not load. Email info@rebearthsolutions.com.</p>}
    </div>}
    {isOpen && isNameSet && !tawkLoaded && <div role="status" className="fixed bottom-24 right-6 z-50 rounded-xl bg-white p-4 text-sm text-gray-700 shadow-xl">Connecting to live chat…{tawkUnavailable && <span className="block text-red-700"> Chat is unavailable. Email info@rebearthsolutions.com.</span>}</div>}
  </>;
};

export default ChatBot;

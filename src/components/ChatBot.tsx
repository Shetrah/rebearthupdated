import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Leaf, Minus } from 'lucide-react';

declare global { interface Window { Tawk_API?: any; Tawk_LoadStart?: Date; } }

const TAWK_PROPERTY_ID = '6a4df9eca6558f1d451fd11c';
const TAWK_WIDGET_ID = '1k5mpl1o9';
const TAWK_EMBED_ID = 'tawk_6a4df9eca6558f1d451fd11c';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (document.getElementById('tawk-script')) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.embedded = TAWK_EMBED_ID;
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.onLoad = () => setIsLoaded(true);

    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.charset = 'UTF-8';
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.setAttribute('crossorigin', '*');
    script.onerror = () => setHasError(true);
    document.body.appendChild(script);
  }, []);

  return <>
    {/* Persistent embedded mount lets Tawk initialize before the popup is opened. */}
    <section
      aria-label="Rebearth live chat"
      aria-hidden={!isOpen}
      className={`fixed bottom-24 right-4 z-[60] flex h-[min(600px,calc(100dvh-8rem))] w-[min(390px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(0,0,0,.24)] ring-1 ring-black/5 transition duration-200 sm:right-6 ${isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}
    >
      <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-4 py-3.5 text-white">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Leaf size={20}/></div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold">Rebearth Solutions</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-100">
            <span className={`h-2 w-2 rounded-full ${isLoaded ? 'bg-emerald-300' : hasError ? 'bg-rose-300' : 'bg-amber-300'}`}/>
            {isLoaded ? 'Chat with our team' : hasError ? 'Chat unavailable' : 'Connecting…'}
          </p>
        </div>
        <button onClick={() => setIsOpen(false)} aria-label="Minimize chat" className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"><Minus size={19}/></button>
        <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"><X size={19}/></button>
      </header>
      <div className="relative min-h-0 flex-1 bg-[#efeae2]">
        <div className="absolute inset-0 opacity-[.13]" style={{ backgroundImage: 'radial-gradient(#49635b 0.7px, transparent 0.7px)', backgroundSize: '14px 14px' }}/>
        <div id={TAWK_EMBED_ID} className="relative z-10 h-full w-full" />
        {hasError && <div className="absolute inset-0 z-20 grid place-items-center bg-[#efeae2] p-6 text-center"><div className="rounded-2xl bg-white p-5 shadow-sm"><p className="font-semibold text-slate-800">Live chat could not connect.</p><p className="mt-2 text-sm text-slate-600">Email <a className="font-semibold text-[#075e54] underline" href="mailto:info@rebearthsolutions.com">info@rebearthsolutions.com</a> and we’ll get back to you.</p></div></div>}
      </div>
      <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-2 text-center text-[10px] text-gray-400">Rebearth customer care</footer>
    </section>

    <button
      onClick={() => setIsOpen(open => !open)}
      aria-label={isOpen ? 'Close live chat' : 'Chat with Rebearth'}
      aria-expanded={isOpen}
      className="fixed bottom-5 right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#075e54] text-white shadow-lg shadow-emerald-950/25 transition hover:scale-105 hover:bg-[#064e46] focus:outline-none focus:ring-4 focus:ring-emerald-200 sm:bottom-6 sm:right-6"
    >
      {isOpen ? <X size={25}/> : <MessageCircle size={27}/>}
      {!isOpen && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400"/>}
    </button>
  </>;
};

export default ChatBot;

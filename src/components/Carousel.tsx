import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Carousel: React.FC = () => {
  const images = [
    'https://images.pexels.com/photos/32585657/pexels-photo-32585657.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
    'https://images.pexels.com/photos/32585788/pexels-photo-32585788.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
    'https://images.pexels.com/photos/32585762/pexels-photo-32585762.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
    'https://images.pexels.com/photos/32585828/pexels-photo-32585828.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
    'https://images.pexels.com/photos/32585813/pexels-photo-32585813.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [managedImages, setManagedImages] = useState<string[]>([]);
  useEffect(() => { let alive = true; supabase.from('site_content').select('value').eq('key','hero_images').maybeSingle().then(({data}) => { if (!alive || !data?.value) return; try { const parsed = JSON.parse(data.value); if (Array.isArray(parsed)) setManagedImages(parsed.filter((url:any)=>typeof url === 'string' && /^https?:\/\//.test(url))); } catch { /* keep the original carousel if the saved value is not valid JSON */ } }); return ()=>{alive=false;}; }, []);
  const activeImages = managedImages.length ? managedImages : images;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeImages.length]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {activeImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Agricultural scene ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {activeImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
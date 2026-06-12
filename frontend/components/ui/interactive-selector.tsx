"use client";

import React, { useState, useEffect } from 'react';
import { Tent, Flame, Droplets, Waves, Map } from 'lucide-react';

const InteractiveSelector = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);
  
  const options = [
    {
      title: "Luxury Tent",
      description: "Cozy glamping under the stars",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
      icon: <Tent size={24} className="text-white" />
    },
    {
      title: "Campfire Feast",
      description: "Gourmet s'mores & stories",
      image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
      icon: <Flame size={24} className="text-white" />
    },
    {
      title: "Lakeside Retreat",
      description: "Private dock & canoe rides",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      icon: <Droplets size={24} className="text-white" />
    },
    {
      title: "Mountain Spa",
      description: "Outdoor sauna & hot tub",
      image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
      icon: <Waves size={24} className="text-white" />
    },
    {
      title: "Guided Adventure",
      description: "Expert-led nature tours",
      image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
      icon: <Map size={24} className="text-white" />
    }
  ];

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-20 bg-stone-950 font-sans text-white overflow-hidden rounded-3xl my-12 shadow-2xl"> 
      {/* Header Section */}
      <div className="w-full max-w-2xl px-6 mb-12 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg animate-fadeInTop delay-300">
          Escape in <span className="text-emerald-400">Style.</span>
        </h2>
        <p className="text-lg text-stone-400 font-medium max-w-xl mx-auto animate-fadeInTop delay-600">
          Temukan pengalaman berkemah mewah di lokasi alam yang paling menakjubkan.
        </p>
      </div>

      {/* Options Container */}
      <div className="options flex w-full max-w-[1000px] min-w-[300px] md:min-w-[600px] h-[500px] mx-auto items-stretch overflow-hidden relative px-4">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              option relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out rounded-2xl mx-1
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'auto 100%' : 'auto 120%',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '70px',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index 
                ? '0 20px 60px rgba(4, 120, 87, 0.3)' 
                : '0 10px 30px rgba(0,0,0,0.50)',
              flex: activeIndex === index ? '7 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Shadow effect */}
            <div 
              className="shadow absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-700 ease-in-out"
              style={{
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                opacity: activeIndex === index ? 1 : 0.7
              }}
            />
            
            {/* Label with icon and info */}
            <div className="label absolute left-0 right-0 bottom-6 flex items-center justify-start h-12 z-20 pointer-events-none px-4 w-full">
              <div className={`icon min-w-[48px] h-[48px] flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border-2 flex-shrink-0 transition-all duration-500 ${activeIndex === index ? 'bg-emerald-600/90 border-emerald-400' : 'bg-stone-900/80 border-stone-600'}`}>
                {option.icon}
              </div>
              <div className="info text-white whitespace-nowrap ml-4 relative overflow-hidden flex-1">
                <div 
                  className="main font-extrabold text-xl transition-all duration-700 ease-in-out drop-shadow-md"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.title}
                </div>
                <div 
                  className="sub text-sm text-emerald-200 font-medium transition-all duration-700 ease-in-out delay-100"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInFromTop {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInTop {
          opacity: 0;
          animation: fadeInFromTop 0.8s ease-in-out forwards;
        }
        .delay-300 { animation-delay: 0.3s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
};

export default InteractiveSelector;
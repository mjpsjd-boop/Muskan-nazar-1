import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ScrollText, ShieldCheck } from "lucide-react";

interface HeroProps {
  onExploreCouture: () => void;
  onOpenBespoke: () => void;
}

export default function Hero({ onExploreCouture, onOpenBespoke }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1600",
      tag: "THE HEIRLOOM SERIES",
      title: "Royal Bridals & Bespoke Couture",
      desc: "Impeccably tailored silhouettes layered with heirloom gold zardozi and antique tilla threadwork. Sculpted over hundreds of hours by master artisans."
    },
    {
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600",
      tag: "LUXURY FORMALS '26",
      title: "The Dilruba Peshwas Gown",
      desc: "Delicate panels of crushed organza, sheer handwoven tissue, and intricate gota embellishments cascading into a magnificent 12-meter flare."
    },
    {
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1600",
      tag: "WORLDWIDE HAND-MADE EXCLUSIVITY",
      title: "Tailored to Your Exact Proportions",
      desc: "Enter your body measurements or book a virtual concierge session. We deliver flawless haute couture right to your doorstep, anywhere on the globe."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div id="hero" className="relative w-full h-[85vh] overflow-hidden bg-black select-none">
      
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-70 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{ transition: "all 1.2s cubic-bezier(0.25, 1, 0.5, 1)" }}
        >
          {/* Parallax Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/80 z-10"></div>
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center transform scale-105"
          />
          
          {/* Content Overlays */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-6 sm:px-12 md:px-24 max-w-5xl">
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.4em] text-[#C5A059] uppercase mb-4 block animate-fade-in-down font-medium">
              {slide.tag}
            </span>
            
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight font-light uppercase max-w-3xl mb-6">
              {slide.title.split(" & ").map((part, i) => (
                <span key={i} className="block">
                  {part}
                  {i === 0 && slide.title.includes(" & ") && <span className="font-serif italic font-normal text-[#C5A059]"> & </span>}
                </span>
              ))}
            </h2>
            
            <p className="font-sans text-xs sm:text-sm md:text-base text-gray-300 font-light tracking-wide max-w-xl leading-relaxed mb-10">
              {slide.desc}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                onClick={onExploreCouture}
                className="px-6 py-3.5 bg-white text-black hover:bg-[#C5A059] hover:text-white font-sans text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center gap-2 group shadow-lg"
              >
                <span>View Collections</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onOpenBespoke}
                className="px-6 py-3.5 border border-[#C5A059]/60 text-[#C5A059] hover:border-white hover:text-white font-sans text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center gap-2 bg-black/40 backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Bespoke Design Suite</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full border border-white/10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full border border-white/10 transition-colors"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Slide indicators at the bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              idx === currentSlide ? "w-8 bg-[#C5A059]" : "w-2 bg-white/40"
            }`}
          ></button>
        ))}
      </div>

      {/* Dynamic luxury trust badges overlay */}
      <div className="absolute bottom-6 right-8 z-30 hidden lg:flex items-center gap-6 text-[10px] font-mono tracking-widest text-[#f5efe4]/85">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 border border-white/5 rounded-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>INSURED GLOBAL DHL COURIER</span>
        </div>
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 border border-white/5 rounded-sm">
          <ScrollText className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>100% TAILORED WARRANTY</span>
        </div>
      </div>
    </div>
  );
}

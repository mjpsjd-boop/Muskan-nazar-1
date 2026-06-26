import React from "react";
import { Star, CheckCircle, Quote, Instagram, Sparkles } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Fatima Al-Subaih",
      location: "Riyadh, Saudi Arabia",
      rating: 5,
      event: "Grand Bridal Barat Outfit",
      comment: "The Shahzadi lehenga exceeded every single hope I had. The heavy gold zardozi wirework looks magnificent in photographs, and the custom fitting drafted by their master tailor sculpts the silhouette flawlessly. The worldwide DHL express was pristine.",
      date: "May 2026",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: 2,
      name: "Zara Mahmood",
      location: "London, United Kingdom",
      rating: 5,
      event: "Bespoke Silk Reception Gown",
      comment: "My silver tissue gown made for my reception was an absolute masterpiece. The mirror work sparkled beautifully under soft lighting. The AI Concierge stylist recommended the slate blue color scheme, and I couldn't be happier with their suggestions!",
      date: "June 2026",
      image: "https://images.unsplash.com/photo-1518049360907-72d546411af8?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: 3,
      name: "Ayesha Siddiqui",
      location: "New York, USA",
      rating: 5,
      event: "Dilruba Peshwas & Ready-to-Wear",
      comment: "Absolutely outstanding quality. The 12-meter flare on the crushed organza is spectacular. It feels like wearing high couture artwork. Worth every dollar, and more.",
      date: "April 2026",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200"
    }
  ];

  return (
    <section id="story" className="py-24 bg-[#FAF9F6] border-b border-black/5 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            CLIENT ELEVATIONS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-black font-light mb-4">
            Atelier Confessions & Reviews
          </h2>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-6"></div>
          <p className="font-sans text-xs sm:text-sm text-gray-500 font-light leading-relaxed tracking-wide">
            Read confessions from our verified international clients wearing Muskan Nazar bespoke couture across the globe.
          </p>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-black/5 p-8 flex flex-col justify-between hover:border-[#C5A059] transition-all duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-[#E5E1DA] opacity-40" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                  ))}
                </div>

                <p className="font-sans text-xs sm:text-sm text-[#121212]/80 font-light leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="border-t border-black/5 pt-6 mt-6 flex items-center gap-4 relative z-10">
                <img
                  src={rev.image}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-black/10 grayscale-[10%]"
                />
                <div>
                  <h4 className="font-serif text-xs uppercase tracking-wider text-[#121212] font-semibold flex items-center gap-1 group-hover:text-[#C5A059] transition-colors">
                    <span>{rev.name}</span>
                    <CheckCircle className="w-3 h-3 text-[#C5A059]" />
                  </h4>
                  <p className="font-sans text-[10px] text-gray-400 tracking-wide">{rev.location} | <span className="text-[#C5A059]">{rev.event}</span></p>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Designer story teaser */}
        <div className="mt-20 border border-black/5 bg-white p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="font-mono text-xs text-[#C5A059] tracking-[0.3em] uppercase block font-semibold">OUR TIMELINE STORY</span>
            <h3 className="font-serif text-2xl sm:text-3xl text-gray-900 font-light uppercase tracking-wide">
              Preserving Ancient Crafts
            </h3>
            <p className="font-sans text-xs sm:text-sm text-gray-600 font-light leading-relaxed tracking-wide">
              Muskan Nazar was founded on a simple vision: to bridge centuries-old classical South Asian threadwork with modern, ultra-clean silhouettes. We believe bridal wear should carry weight—both in its hand-embroidered gold wires, and its emotional heritage. Every purchase supports generational master artisans keeping the craft alive.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-[#C5A059] uppercase tracking-widest font-semibold">
                <Sparkles className="w-4 h-4 animate-bounce" />
                <span>100% Hand-Tailored</span>
              </div>
              <span className="h-4 w-px bg-black/10"></span>
              <div className="flex items-center gap-1.5 text-xs text-[#C5A059] uppercase tracking-widest font-semibold">
                <Instagram className="w-4 h-4" />
                <span>@MuskanNazarAtelier</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-video sm:aspect-square overflow-hidden border border-black/5 h-72 sm:h-96">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
              alt="Artisan sewing close detail"
              className="w-full h-full object-cover object-center grayscale-[15%]"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

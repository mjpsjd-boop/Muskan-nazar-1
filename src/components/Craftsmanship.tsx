import React from "react";
import { Sparkles, Trophy, Flame } from "lucide-react";

export default function Craftsmanship() {
  const steps = [
    {
      icon: <Sparkles className="w-5 h-5 text-[#C5A059]" />,
      title: "Artisan-Made Zardozi",
      desc: "An ancient embroidery method using copper wire spun with real gold, sewn onto premium silks and velvets."
    },
    {
      icon: <Trophy className="w-5 h-5 text-[#C5A059]" />,
      title: "Flawless Tailor Sculpture",
      desc: "Our master drapers draft a custom master blueprint for your dress, individually cut and adjusted to millimeter precision."
    },
    {
      icon: <Flame className="w-5 h-5 text-[#C5A059]" />,
      title: "Handloom Jamawar",
      desc: "Exquisite hand-woven fabrics sourced directly from legendary artisan communities keeping centuries-old looms alive."
    }
  ];

  return (
    <section id="craftsmanship" className="py-24 bg-[#FAF9F6] border-b border-black/5 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            THE HOUSE HERITAGE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-black font-light mb-4">
            Masterful Craftsmanship
          </h2>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-6"></div>
          <p className="font-sans text-xs sm:text-sm text-[#121212]/70 font-light leading-relaxed tracking-wide">
            Every garment born in the Muskan Nazar atelier is a testament to preservation. We collaborate with generational master artisans to hand-embroider, hand-dye, and perfectly drape each silhouette.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main big block */}
          <div className="lg:col-span-7 bg-white border border-black/5 p-8 sm:p-12 flex flex-col justify-between relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAF9F6] rounded-full filter blur-2xl -mr-10 -mt-10 opacity-60"></div>
            
            <div>
              <span className="font-mono text-[10px] text-[#C5A059] tracking-[0.3em] uppercase block mb-2">Atelier Hours</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light uppercase tracking-wide text-gray-900 mb-6">
                400+ Hours of Devotion
              </h3>
              <p className="font-sans text-xs sm:text-sm text-gray-600 font-light leading-relaxed mb-6 max-w-lg">
                Our heavy bridals undergo a meticulously charted progression: from charcoal sketching on silk panels, to gold wire thread-lay, to final stone inlays. The resulting weight, texture, and brilliance are unmatched by modern machine replicas.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-black/5 pt-8 mt-6">
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#C5A059] font-light block">100%</span>
                <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest block mt-1">Hand-Embellished</span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#C5A059] font-light block">400h</span>
                <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest block mt-1">Artisan Devotion</span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#C5A059] font-light block">1-on-1</span>
                <span className="font-sans text-[10px] text-gray-400 uppercase tracking-widest block mt-1">Bespoke Drape</span>
              </div>
            </div>
          </div>

          {/* Image block */}
          <div className="lg:col-span-5 h-[300px] lg:h-auto relative overflow-hidden group border border-black/5">
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800"
              alt="Luxury embroidery closeup"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000 grayscale-[10%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <span className="font-mono text-[9px] text-[#C5A059] tracking-[0.3em] uppercase mb-1">PRESIDENT SELECTION</span>
              <h4 className="font-serif text-lg text-white font-light uppercase tracking-wide">Metallic Gota-Patti & Crystals</h4>
            </div>
          </div>

        </div>

        {/* Triple pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-black/5 p-8 hover:border-[#C5A059] transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="mb-6 flex justify-center items-center w-10 h-10 bg-[#FAF9F6] rounded-full border border-black/5">
                {step.icon}
              </div>
              <div>
                <h4 className="font-serif text-base uppercase tracking-wider text-gray-900 mb-2 group-hover:text-[#C5A059] transition-colors">
                  {step.title}
                </h4>
                <p className="font-sans text-xs text-gray-600 font-light leading-relaxed tracking-wide">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

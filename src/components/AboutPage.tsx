import React from "react";
import { Sparkles, Heart, Globe, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-12 bg-[#FAF9F6] text-[#121212] select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mt-8">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-4 font-semibold">
            THE ATELIER MANIFESTO
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-wide uppercase font-light text-gray-900 leading-tight">
            Weaving the Threads of Time
          </h1>
          <div className="w-16 h-[1.5px] bg-[#C5A059] mx-auto my-8"></div>
          <p className="font-serif italic text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
            "Haute Couture is not merely a garment. It is a 400-hour canvas of gold suture and hand-woven memory, built to live across generations."
          </p>
        </div>

        {/* Hero image and text duo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden border border-black/5 rounded-sm shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
              alt="Atelier Crimson velvet detailing"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-6">
            <span className="font-mono text-[10px] text-[#C5A059] tracking-[0.3em] uppercase block font-semibold">
              OUR HISTORIC HERITAGE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light uppercase text-gray-900 tracking-wide">
              The Vision of Muskan Nazar
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-600 font-light leading-relaxed tracking-wide">
              Muskan Nazar was established to breathe modern, clean architectural lines into the complex heritage fabrics of the Mughal era. Every Peshwas, Lehenga, and Gown we create represents a seamless intersection between traditional craftsmanship and minimalist modern drape.
            </p>
            <p className="font-sans text-xs sm:text-sm text-gray-600 font-light leading-relaxed tracking-wide">
              We reject the fast-fashion cycle of instant disposal. Instead, our atelier focuses exclusively on bespoke couture and limited-edition luxury drops. By utilizing ethically sourced pure silks, Italian organza mesh, and 24k gold-wrapped wires (tilla), our garments carry the tangible weight of real luxury.
            </p>
          </div>
        </div>

        {/* Brand pillars (Bento Layout) */}
        <div className="space-y-12">
          <div className="text-center">
            <span className="font-mono text-xs text-[#C5A059] tracking-[0.3em] uppercase block font-semibold mb-2">
              PILLARS OF TRUST
            </span>
            <h2 className="font-serif text-2xl uppercase tracking-wide font-light text-gray-900">
              The Core Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-white border border-black/5 p-8 text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
              <div className="w-12 h-12 bg-[#FAF9F6] border border-black/5 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-sm uppercase tracking-widest font-semibold">Generational Artisans</h3>
              <p className="font-sans text-xs text-gray-500 font-light leading-relaxed">
                We sustain over 120 family weavers and heritage embroidery craftsmen in local ateliers, keeping the pure Lucknowi Zardozi and Gota looms alive.
              </p>
            </div>

            <div className="bg-white border border-black/5 p-8 text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
              <div className="w-12 h-12 bg-[#FAF9F6] border border-black/5 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-sm uppercase tracking-widest font-semibold">Premium Raw Fabrics</h3>
              <p className="font-sans text-xs text-gray-500 font-light leading-relaxed">
                Only the absolute highest GSM mulberry silks, metallic crimp tissue from Como, Italy, and double-lined satin lining touch your skin.
              </p>
            </div>

            <div className="bg-white border border-black/5 p-8 text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
              <div className="w-12 h-12 bg-[#FAF9F6] border border-black/5 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-sm uppercase tracking-widest font-semibold">Bespoke Tailoring</h3>
              <p className="font-sans text-xs text-gray-500 font-light leading-relaxed">
                Every bespoke order triggers an advanced digital-to-atelier blueprint where master tailors sculpt each panel to your personal proportions.
              </p>
            </div>

            <div className="bg-white border border-black/5 p-8 text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
              <div className="w-12 h-12 bg-[#FAF9F6] border border-black/5 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-serif text-sm uppercase tracking-widest font-semibold">Worldwide Delivery</h3>
              <p className="font-sans text-xs text-gray-500 font-light leading-relaxed">
                Our global courier partner DHL Express ensures fully insured transit, high-end protective custom garment trunks, and direct real-time GPS tracking.
              </p>
            </div>

          </div>
        </div>

        {/* In-depth details about fabrics & embroidery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <span className="font-mono text-[10px] text-[#C5A059] tracking-[0.3em] uppercase block font-semibold">
              PRESTIGE STANDARDS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light uppercase text-gray-900 tracking-wide">
              The Alchemy of Material Selection
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-600 font-light leading-relaxed tracking-wide">
              A premium gown is only as perfect as its primary fiber. Our fabrics are hand-inspected for weight, threadcount, and dye absorption. We source natural fibers from pure silk cocoon harvests, resulting in rich silks that fall beautifully into classic drapes without clinging.
            </p>
            <div className="space-y-4">
              <div className="border-l-2 border-[#C5A059] pl-4">
                <h4 className="font-serif text-xs uppercase tracking-widest font-bold">24-Karat Tilla Wire</h4>
                <p className="font-sans text-[11px] text-gray-500 font-light">Fine silver filaments wrapped in pure 24k gold, crafted painstakingly by master drapers to prevent tarnishing across the years.</p>
              </div>
              <div className="border-l-2 border-[#C5A059] pl-4">
                <h4 className="font-serif text-xs uppercase tracking-widest font-bold">Swarovski Crystal Hand-Sewing</h4>
                <p className="font-sans text-[11px] text-gray-500 font-light">Each crystal bead is placed individually and double-stitched securely, promising an ethereal glow that responds to luxury banquet lights.</p>
              </div>
            </div>
          </div>
          <div className="aspect-[16/10] bg-gray-100 overflow-hidden border border-black/5 rounded-sm order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
              alt="Artisan loom detailing"
              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

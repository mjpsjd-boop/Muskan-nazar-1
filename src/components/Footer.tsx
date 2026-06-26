import React, { useState } from "react";
import { Send, Instagram, Mail, ShieldCheck, HelpCircle, Heart, Globe } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 2000);
  };

  return (
    <footer className="bg-[#121212] text-[#FAF9F6] pt-20 pb-10 border-t border-black/5 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Identity Card */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-[0.2em] uppercase font-light text-white leading-none">
              Muskan Nazar
            </h3>
            <p className="font-sans text-[8px] tracking-[0.4em] uppercase text-[#C5A059] font-medium pl-0.5">
              Bespoke Haute Couture
            </p>
            <p className="font-sans text-xs text-gray-400 font-light leading-relaxed max-w-xs pt-2">
              An elite luxury fashion house keeping heritage craftsmanship and gold wirework alive. Sculpted silhouettes, individually tailor-fit and delivered worldwide.
            </p>
          </div>

          {/* Sizing & Consulting Links */}
          <div className="space-y-4 text-xs font-sans">
            <h4 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold">Atelier Services</h4>
            <ul className="space-y-2 text-gray-400 font-light">
              <li><span className="hover:text-white cursor-pointer transition-colors">Bespoke Couture Fitting Suite</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">1-on-1 Virtual AI Stylist Concierge</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Bridal Veil Customizations</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Fabric Selection Library</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Atelier Workshop Tour</span></li>
            </ul>
          </div>

          {/* Policy / Trust Links */}
          <div className="space-y-4 text-xs font-sans">
            <h4 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold">Corporate Governance</h4>
            <ul className="space-y-2 text-gray-400 font-light">
              <li><span className="hover:text-white cursor-pointer transition-colors">Worldwide Shipping & DHL Insured Terms</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Return Safeguards & Fitting Warranty</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Ethical Artisan Sourcing Audits</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Private Data Shield Regulations</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Secure Checkout & Fraud Prevention</span></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-sans font-semibold">Couture Priority Drop list</h4>
            <p className="text-xs text-gray-400 font-light font-sans max-w-xs leading-relaxed">
              Subscribe to secure private alerts for luxury seasonal collections drops, bridal custom slot availability, and atelier journals.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex border-b border-gray-600 pb-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for priority drops..."
                className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 font-sans focus:outline-none"
              />
              <button type="submit" className="text-[#C5A059] hover:text-white transition-colors">
                {subscribed ? <span className="text-[10px] uppercase font-mono text-green-500">Subscribed</span> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

        </div>

        {/* Global standards */}
        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-[11px] font-sans text-gray-500">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-[#C5A059]" />
              <span>Insured DHL Express Shipping Worldwide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4.5 h-4.5 text-[#C5A059]" />
              <span>Multi-Currency Ledger Support</span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex gap-4 items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-600">Follow Atelier:</span>
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors"><Instagram className="w-4.5 h-4.5" /></span>
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors"><Mail className="w-4.5 h-4.5" /></span>
          </div>
        </div>

        {/* Brand Bottom line */}
        <div className="border-t border-white/5 pt-6 text-center text-[10px] font-mono text-gray-600 tracking-wider flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Muskan Nazar Bespoke Haute Couture. All intellectual property preserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy Safeguards</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Artisan Foundation</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

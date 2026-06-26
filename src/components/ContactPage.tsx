import React, { useState } from "react";
import { MessageSquare, Mail, MapPin, Clock, Phone, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "Bespoke Couture Bridal",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please complete all required fields before sending.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      // Post to our server bespoke/request as custom request or mock email inquiry notification!
      // To keep it 100% database integrated, let's submit it to custom dress request, or trigger a notification on the backend!
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          items: [{ productId: "inquiry", productName: `Inquiry: ${formData.inquiryType}`, price: 0, quantity: 1, selectedColor: "Default", selectedFabric: "Default", selectedSize: "Default", isCustomized: true }],
          totalAmount: 0,
          currency: "INR",
          shippingAddress: { street: "Inquiry Form Submit", city: "Online", state: "Contact", zipCode: "000000", country: "India" },
          paymentMethod: "Form Submission"
        })
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", inquiryType: "Bespoke Couture Bridal", message: "" });
      } else {
        setError("Atelier server is busy. Please try calling our WhatsApp hotline.");
      }
    } catch (err) {
      setError("Failed to connect to the atelier server. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-[#FAF9F6] text-[#121212] select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Page title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            ATELIER CHANNELS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-black font-light mb-4">
            Connect With Our Designers
          </h1>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-6"></div>
          <p className="font-sans text-xs sm:text-sm text-gray-500 font-light leading-relaxed tracking-wide">
            Whether booking an in-person measurement fitting, inquiring about customized bridal drapes, or requesting order updates, our concierges are at your disposal.
          </p>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Channel 1: WhatsApp Helpline */}
          <div className="bg-white border border-black/5 p-8 flex flex-col items-center text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
            <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center border border-black/5">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900">WhatsApp Concierge</h3>
            <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-xs font-light">
              Chat instantly with our head stylist for fitting guidance and style selections.
            </p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A059] hover:text-black font-sans text-xs font-semibold tracking-widest uppercase border-b border-[#C5A059]/30 hover:border-[#C5A059] pt-2"
            >
              +91 98765 43210
            </a>
          </div>

          {/* Channel 2: Email */}
          <div className="bg-white border border-black/5 p-8 flex flex-col items-center text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
            <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center border border-black/5">
              <Mail className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900">Official Inquiries</h3>
            <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-xs font-light">
              For corporate partnerships, custom wholesale orders, and global carrier tracking.
            </p>
            <a
              href="mailto:atelier@muskannazar.com"
              className="text-[#C5A059] hover:text-black font-sans text-xs font-semibold tracking-widest uppercase border-b border-[#C5A059]/30 hover:border-[#C5A059] pt-2"
            >
              atelier@muskannazar.com
            </a>
          </div>

          {/* Channel 3: Business Hours */}
          <div className="bg-white border border-black/5 p-8 flex flex-col items-center text-center space-y-4 rounded-sm hover:border-[#C5A059] transition-all">
            <div className="w-12 h-12 bg-[#FAF9F6] rounded-full flex items-center justify-center border border-black/5">
              <Clock className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900">Atelier Hours</h3>
            <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-xs font-light">
              Monday through Saturday, strictly by prior digital booking appointments only.
            </p>
            <span className="font-mono text-[10px] uppercase text-gray-700 tracking-wider">
              10:00 AM – 8:00 PM (IST)
            </span>
          </div>

        </div>

        {/* Contact Form & Map details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Interactive Form */}
          <div className="bg-white border border-black/5 p-8 sm:p-10 rounded-sm space-y-6">
            <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900 font-light border-b border-black/5 pb-3">
              Request Private Atelier Callback
            </h3>

            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Your inquiry has been logged securely in our database.</p>
                  <p className="font-light">A senior couture representative will message you on WhatsApp or call you within 1 business hour. Thank you.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-light">{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">FullName *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g., +91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Couture Interest *</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 cursor-pointer"
                  >
                    <option value="Bespoke Couture Bridal">Bespoke Couture Bridal (₹5,00,000+)</option>
                    <option value="Luxury Formals Customization">Luxury Formals Customization (₹1,50,000+)</option>
                    <option value="Ready-To-Wear Inquiry">Ready-To-Wear Sizing Inquiry</option>
                    <option value="International DHL Shipping Request">International DHL Shipping Request</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Detailed Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your design specifications, ideal colors, and custom event deadlines..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#121212] hover:bg-[#C5A059] text-white py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:bg-gray-400"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "LOGGING IN DATABASE..." : "REQUEST Callback"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Location details */}
          <div className="space-y-6">
            <div className="bg-white border border-black/5 p-8 rounded-sm space-y-4">
              <span className="font-mono text-[9px] text-[#C5A059] tracking-widest uppercase font-semibold">
                HEAD ATELIER LOCATION
              </span>
              <h3 className="font-serif text-lg uppercase tracking-wide text-gray-900 font-light">
                Muskan Nazar Central Salon
              </h3>
              
              <div className="space-y-4 font-sans text-xs text-gray-600 leading-relaxed font-light">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>Atelier Suite 104, Golf Course Road, Sector 54, Gurugram, NCR Delhi, 122003, India</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>Direct Salon: +91 124 456 7890</span>
                </div>
              </div>

              {/* Decorative elegant map substitute */}
              <div className="w-full h-44 bg-gray-100 rounded-sm relative overflow-hidden border border-black/5">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400"
                  alt="Elegant interior showroom"
                  className="w-full h-full object-cover object-center grayscale-[20%]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#121212]/30 flex flex-col justify-end p-4 text-white">
                  <p className="font-serif text-xs uppercase tracking-widest font-bold">1-On-1 Virtual Video Walkthroughs</p>
                  <p className="font-sans text-[10px] opacity-80">Available worldwide on Google Meet or Zoom.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

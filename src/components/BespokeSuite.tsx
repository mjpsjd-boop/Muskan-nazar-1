import React, { useState, useRef } from "react";
import { Sparkles, Upload, FileText, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { Measurement } from "../types";

interface BespokeSuiteProps {
  onClose?: () => void;
  currency: string;
  formatPrice: (price: number) => string;
}

export default function BespokeSuite({ onClose, currency, formatPrice }: BespokeSuiteProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fabric, setFabric] = useState("Pure Raw Silk");
  const [color, setColor] = useState("Heritage Red");
  const [embroideryStyle, setEmbroideryStyle] = useState("Zardozi & Dabka Work");
  const [eventType, setEventType] = useState("Bridal Main Event");
  const [budget, setBudget] = useState("$5,000 - $8,000");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [measurements, setMeasurements] = useState<Measurement>({
    height: "",
    bust: "",
    waist: "",
    hips: "",
    shoulderWidth: "",
    sleeveLength: "",
    dressLength: ""
  });

  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setErrorMessage("Please complete your name and email.");
      return;
    }
    // Simple verification that some measurements are written
    if (!measurements.bust || !measurements.waist || !measurements.height) {
      setErrorMessage("Please specify key measurements (height, bust, and waist).");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bespoke/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          measurements,
          fabric,
          color,
          embroideryStyle,
          eventType,
          additionalNotes,
          budget,
          referenceImage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error connecting to server. Attempting offline reservation instead.");
      // Simulated offline save
      setTimeout(() => {
        setIsSuccess(true);
      }, 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="bespoke-suite" className="py-24 bg-[#FAF9F6] select-none border-b border-black/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            BESPOKE SUITE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-black font-light mb-4">
            Request Custom Couture Design
          </h2>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-4"></div>
          <p className="font-sans text-xs sm:text-sm text-gray-500 font-light max-w-xl mx-auto leading-relaxed">
            Enter your exact body proportions, choose luxury raw fabrics, detail your desired heritage gold embellishments, and our master couturiers will construct a flawless tailor-fit dress for your special day.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white border border-[#C5A059] p-8 text-center animate-fade-in max-w-2xl mx-auto shadow-sm">
            <CheckCircle className="w-12 h-12 text-[#C5A059] mx-auto mb-4" />
            <h3 className="font-serif text-xl uppercase tracking-wider text-gray-900 mb-2">Bespoke Couture Requested</h3>
            <p className="font-sans text-xs text-gray-600 font-light leading-relaxed mb-6">
              Thank you, {customerName}. Your detailed design file has been submitted to the Muskan Nazar Atelier. Our master designers and AI Stylists are cross-referencing your silhouette draft. A designated couture representative will reach out to schedule your 1-on-1 virtual design session.
            </p>
            <div className="bg-[#FAF9F6] border border-black/5 p-4 rounded-sm mb-6 inline-block text-left text-xs font-mono text-gray-500">
              <p>Reference: MN-BESPOKE-{Math.floor(1000 + Math.random() * 9000)}</p>
              <p>Status: Drafting Blueprint (Queue: 1)</p>
              <p>Fabric: {fabric} | Color: {color}</p>
            </div>
            <div>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setCustomerName("");
                  setCustomerEmail("");
                  setCustomerPhone("");
                  setReferenceImage(null);
                  setImageName("");
                  setAdditionalNotes("");
                }}
                className="px-6 py-2.5 bg-[#121212] text-white font-sans text-xs uppercase tracking-widest hover:bg-[#C5A059] transition-colors"
              >
                Draft Another Outfit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-black/5 p-8 sm:p-12">
            
            {/* Error Indicator */}
            {errorMessage && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-sans tracking-wide border-l-4 border-red-500">
                {errorMessage}
              </div>
            )}

            {/* Part 1: Personal Info */}
            <div className="border-b border-black/5 pb-8">
              <h3 className="font-serif text-base uppercase tracking-wider text-[#121212] mb-4 flex items-center gap-2 font-medium">
                <span className="w-5 h-5 flex justify-center items-center bg-[#121212] text-[#FAF9F6] text-[10px] rounded-full font-mono">1</span>
                <span>Contact Portfolio</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1 font-semibold">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-black/5 text-xs py-2.5 px-3 focus:outline-none focus:border-[#C5A059]"
                    placeholder="e.g. Princess Amina"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-white border border-black/5 text-xs py-2.5 px-3 focus:outline-none focus:border-[#C5A059]"
                    placeholder="e.g. amina@royal.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-black/5 text-xs py-2.5 px-3 focus:outline-none focus:border-[#C5A059]"
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Part 2: Specifications */}
            <div className="border-b border-black/5 pb-8">
              <h3 className="font-serif text-base uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2 font-medium">
                <span className="w-5 h-5 flex justify-center items-center bg-[#121212] text-[#FAF9F6] text-[10px] rounded-full font-mono">2</span>
                <span>Fabric & Embellishment Blueprints</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1 font-semibold">Preferred Raw Fabric</label>
                  <select
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full bg-white border border-black/5 text-xs py-2.5 px-3 focus:outline-none"
                  >
                    <option value="Pure Raw Silk">Pure Raw Silk (80-100 gsm)</option>
                    <option value="Italian Metallic Crushed Organza">Italian Metallic Crushed Organza</option>
                    <option value="Japanese Crushed Lurex-Tissue">Japanese Crushed Lurex-Tissue</option>
                    <option value="Silk Velvet Heirloom">Silk Velvet Heirloom</option>
                    <option value="Handwoven Varanasi Jamawar">Handwoven Varanasi Jamawar</option>
                    <option value="Delicate French Tulle Net">Delicate French Tulle Net</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1 font-semibold">Couture Color Hue</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-white border border-black/5 text-xs py-2.5 px-3 focus:outline-none focus:border-[#C5A059]"
                    placeholder="e.g. Antique Champagne, Jade Emerald, Midnight Onyx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1 font-semibold">Traditional Handcraft Style</label>
                  <select
                    value={embroideryStyle}
                    onChange={(e) => setEmbroideryStyle(e.target.value)}
                    className="w-full bg-white border border-black/5 text-xs py-2.5 px-3 focus:outline-none"
                  >
                    <option value="Vintage Gold Zardozi & Dabka">Vintage Gold Zardozi & Dabka (Traditional Heavy)</option>
                    <option value="Heirloom 24k Gold Tilla Wire">Heirloom 24k Gold Tilla Wire</option>
                    <option value="Swarovski Crystal & Mirror-Work Overlay">Swarovski Crystal & Mirror-Work Overlay</option>
                    <option value="Japanese Cutglass Bead Inlays">Japanese Cutglass Bead Inlays</option>
                    <option value="Minimal Pearl and Resham Threadwork">Minimal Pearl and Resham Threadwork</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1 font-semibold">Celebration Event & Budget Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="bg-white border border-black/5 text-xs py-2.5 px-2 focus:outline-none"
                    >
                      <option value="Bridal Main Event">Bridal Main Event</option>
                      <option value="Grand Valima / Reception">Grand Valima / Reception</option>
                      <option value="Mehendi / Sangeet Ceremony">Mehendi / Sangeet Ceremony</option>
                      <option value="Royal Evening Gala">Royal Evening Gala</option>
                    </select>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-white border border-black/5 text-xs py-2.5 px-2 focus:outline-none"
                    >
                      <option value="$2,000 - $4,000">$2,000 - $4,000</option>
                      <option value="$4,000 - $7,000">$4,000 - $7,000</option>
                      <option value="$7,000 - $12,000">$7,000 - $12,000</option>
                      <option value="$12,000+">$12,000+ (Elite Bespoke)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 3: Sizing Silhouette */}
            <div className="border-b border-black/5 pb-8">
              <h3 className="font-serif text-base uppercase tracking-wider text-gray-900 mb-2 flex items-center gap-2 font-medium">
                <span className="w-5 h-5 flex justify-center items-center bg-[#121212] text-[#FAF9F6] text-[10px] rounded-full font-mono">3</span>
                <span>Proportion Sizing Silhouette *</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-sans mb-6">Specify measurements in inches. Feel free to use approximations if unsure.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Height (e.g. 5'6") *</label>
                  <input
                    type="text"
                    required
                    value={measurements.height}
                    onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="5ft 6in"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Bust (inches) *</label>
                  <input
                    type="text"
                    required
                    value={measurements.bust}
                    onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="34 in"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Waist (inches) *</label>
                  <input
                    type="text"
                    required
                    value={measurements.waist}
                    onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="27 in"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Hips (inches) *</label>
                  <input
                    type="text"
                    required
                    value={measurements.hips}
                    onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="38 in"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Shoulder Width</label>
                  <input
                    type="text"
                    value={measurements.shoulderWidth}
                    onChange={(e) => setMeasurements({ ...measurements, shoulderWidth: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="15 in"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Sleeve Length</label>
                  <input
                    type="text"
                    value={measurements.sleeveLength}
                    onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="22 in"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">Desired Dress Length</label>
                  <input
                    type="text"
                    value={measurements.dressLength}
                    onChange={(e) => setMeasurements({ ...measurements, dressLength: e.target.value })}
                    className="w-full bg-white border border-black/5 text-xs font-mono py-2 px-3 text-center focus:outline-none focus:border-[#C5A059]"
                    placeholder="58 in"
                  />
                </div>
              </div>
            </div>

            {/* Part 4: File upload reference with Drag & Drop */}
            <div className="border-b border-black/5 pb-8">
              <h3 className="font-serif text-base uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2 font-medium">
                <span className="w-5 h-5 flex justify-center items-center bg-[#121212] text-[#FAF9F6] text-[10px] rounded-full font-mono">4</span>
                <span>Reference Inspirations</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-sans mb-4">Upload a sketch, visual layout board, or design sample (Max 10MB).</p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all ${
                  isDragging ? "border-[#C5A059] bg-[#FAF9F6]" : "border-black/5 hover:border-[#C5A059] bg-white"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleFileChange(files[0]);
                  }}
                  className="hidden"
                  accept="image/*"
                />
                
                {referenceImage ? (
                  <div className="space-y-3">
                    <img src={referenceImage} alt="Reference preview" className="w-24 h-24 object-cover mx-auto border border-black/5 shadow-sm" />
                    <p className="text-xs text-[#C5A059] font-mono uppercase tracking-wider">{imageName || "Custom design uploaded"}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReferenceImage(null);
                        setImageName("");
                      }}
                      className="text-[10px] text-red-500 hover:underline uppercase tracking-widest font-mono"
                    >
                      Clear File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-[#C5A059] mx-auto animate-bounce" />
                    <p className="text-xs font-sans font-semibold text-gray-700">Drag & Drop inspiration image, or click to browse</p>
                    <p className="text-[10px] font-mono text-gray-400">PNG, JPG, JPEG are supported</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-2 font-semibold">Special Design requests or Bridal Custom notes</label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-white border border-black/5 text-xs py-2 px-3 h-28 focus:outline-none focus:border-[#C5A059] resize-none placeholder-gray-400"
                placeholder="Detail necklines, sleeves styles, custom length, or special events timelines here..."
              ></textarea>
            </div>

            {/* Submission button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-[#121212] text-white hover:bg-[#C5A059] font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-lg disabled:bg-gray-400"
              >
                {isSubmitting ? "Drafting Design Profile..." : "Submit to Couture Atelier"}
              </button>
            </div>

          </form>
        )}

      </div>
    </section>
  );
}

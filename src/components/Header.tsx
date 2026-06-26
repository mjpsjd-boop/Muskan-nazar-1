import React, { useState } from "react";
import { Search, ShoppingBag, Heart, User, Sparkles, Sliders, Menu, X, Globe, Phone } from "lucide-react";

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentCategory: string;
  setCategory: (category: string) => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenAiStylist: () => void;
  onToggleAdmin: () => void;
  isAdminOpen: boolean;
  currency: string;
  setCurrency: (curr: string) => void;
  wishlistCount: number;
  onScrollToSection: (id: string) => void;
}

export default function Header({
  currentPage,
  setCurrentPage,
  currentCategory,
  setCategory,
  onOpenCart,
  cartCount,
  onOpenAiStylist,
  onToggleAdmin,
  isAdminOpen,
  currency,
  setCurrency,
  wishlistCount,
  onScrollToSection
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const navigationItems = [
    { name: "Home", action: () => { if (isAdminOpen) onToggleAdmin(); setCurrentPage("home"); } },
    { name: "Collections", action: () => { if (isAdminOpen) onToggleAdmin(); setCategory("All"); setCurrentPage("collections"); } },
    { name: "Bespoke", action: () => { if (isAdminOpen) onToggleAdmin(); setCurrentPage("bespoke"); } },
    { name: "Bridal", action: () => { if (isAdminOpen) onToggleAdmin(); setCategory("Bridals"); setCurrentPage("bridal"); } },
    { name: "Luxury Formals", action: () => { if (isAdminOpen) onToggleAdmin(); setCategory("Luxury Formals"); setCurrentPage("luxury-formals"); } },
    { name: "About Us", action: () => { if (isAdminOpen) onToggleAdmin(); setCurrentPage("about"); } },
    { name: "Reviews", action: () => { if (isAdminOpen) onToggleAdmin(); setCurrentPage("reviews"); } },
    { name: "Admin Panel", action: onToggleAdmin }
  ];

  const currencies = [
    { code: "INR", symbol: "₹" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "AED", symbol: "AED " },
    { code: "PKR", symbol: "Rs " }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/40 backdrop-blur-md border-b border-black/5 transition-all duration-300">
      {/* Mini top notification bar */}
      <div className="w-full bg-[#121212] text-[#FAF9F6] py-2 px-4 text-center text-[10px] tracking-[0.3em] font-mono flex justify-between items-center max-w-7xl mx-auto sm:px-6 lg:px-8">
        <span className="hidden sm:inline">COMPLIMENTARY WORLDWIDE INSURED COURIER DELIVERY</span>
        <span className="sm:hidden">COMPLIMENTARY WORLDWIDE DELIVERY</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer group relative">
            <Globe className="w-3.5 h-3.5 text-[#C5A059] group-hover:rotate-12 transition-transform" />
            <span className="font-sans uppercase text-[9px] tracking-widest">{currency}</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code} className="text-black bg-white">
                  {curr.code} ({curr.symbol.trim()})
                </option>
              ))}
            </select>
          </div>
          <span className="h-3 w-px bg-white/20"></span>
          <button 
            onClick={() => {
              if (isAdminOpen) {
                onToggleAdmin();
              }
              setCurrentPage("contact");
            }}
            className={`flex items-center gap-1 text-[9px] tracking-widest uppercase transition-all duration-300 ${
              currentPage === "contact" && !isAdminOpen ? "text-[#C5A059] font-semibold" : "text-[#E5E1DA] hover:text-white"
            }`}
          >
            <Phone className="w-3 h-3 text-[#C5A059]" />
            <span>Contact Us</span>
          </button>
        </div>
      </div>

      {/* Main Luxury Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#1a1a1a] hover:text-amber-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Left: Search & AI Assistant Triggers */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="text-[#121212] hover:text-[#C5A059] transition-colors p-1"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              {isSearchExpanded && (
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-b border-[#C5A059] bg-transparent px-2 py-1 text-xs focus:outline-none w-40 font-sans tracking-wide text-gray-800 transition-all duration-300 placeholder-gray-400"
                />
              )}
            </div>

            <button
              onClick={onOpenAiStylist}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C5A059] hover:text-black font-semibold transition-all duration-300 hover:scale-105 group"
            >
              <Sparkles className="w-4 h-4 text-[#C5A059] animate-pulse group-hover:rotate-12 transition-transform" />
              <span>AI Luxury Stylist</span>
            </button>
          </div>

          {/* Center Brand Identity Logo */}
          <div className="text-center cursor-pointer select-none" onClick={() => setCurrentPage("home")}>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.3em] font-light uppercase text-[#121212] leading-none">
              Muskan Nazar
            </h1>
            <p className="font-sans text-[8px] sm:text-[9px] tracking-[0.45em] uppercase text-[#C5A059] mt-1.5 pl-1 font-semibold">
              Bespoke Haute Couture
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onOpenAiStylist}
              className="md:hidden flex items-center justify-center text-[#C5A059] p-1.5"
              title="AI Stylist"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentPage("account")}
              className="relative p-1 text-[#121212] hover:text-[#C5A059] transition-colors cursor-pointer"
              title="My Account"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentPage("wishlist")}
              className="relative group p-1 text-[#121212] hover:text-[#C5A059] transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#C5A059] text-white text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage("cart")}
              className="relative p-1.5 text-[#121212] hover:text-[#C5A059] transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C5A059] text-white text-[9px] font-mono rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Row */}
      <nav className="hidden md:block border-t border-black/5 bg-[#FAF9F6]/40 backdrop-blur-md py-3.5">
        <ul className="flex justify-center items-center gap-10">
          {navigationItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => {
                  if (item.action) {
                    item.action();
                  }
                }}
                className={`font-sans text-[11px] uppercase tracking-[0.3em] transition-all duration-300 hover:text-[#C5A059] cursor-pointer relative py-1 ${
                  ((item.name === "Home" && currentPage === "home") ||
                  (item.name === "Collections" && currentPage === "collections") ||
                  (item.name === "Bespoke" && currentPage === "bespoke") ||
                  (item.name === "Bridal" && currentPage === "bridal") ||
                  (item.name === "Luxury Formals" && currentPage === "luxury-formals") ||
                  (item.name === "About Us" && currentPage === "about") ||
                  (item.name === "Reviews" && currentPage === "reviews")) && !isAdminOpen ||
                  (item.name === "Admin Panel" && isAdminOpen)
                    ? "text-[#C5A059] font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-[#C5A059]"
                    : "text-black/60"
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F6]/95 backdrop-blur-lg border-t border-black/5 py-6 px-4 absolute top-full left-0 w-full shadow-2xl transition-all duration-300 z-50">
          <ul className="space-y-4">
            {navigationItems.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item.action) {
                      item.action();
                    }
                  }}
                  className={`w-full text-left font-sans text-xs uppercase tracking-[0.2em] py-2 border-b border-black/5 ${
                    ((item.name === "Home" && currentPage === "home") ||
                    (item.name === "Collections" && currentPage === "collections") ||
                    (item.name === "Bespoke" && currentPage === "bespoke") ||
                    (item.name === "Bridal" && currentPage === "bridal") ||
                    (item.name === "Luxury Formals" && currentPage === "luxury-formals") ||
                    (item.name === "About Us" && currentPage === "about") ||
                    (item.name === "Reviews" && currentPage === "reviews")) && !isAdminOpen ||
                    (item.name === "Admin Panel" && isAdminOpen)
                      ? "text-[#C5A059] font-bold"
                      : "text-black/70"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAiStylist();
                }}
                className="w-full text-left font-sans text-xs uppercase tracking-[0.2em] py-2 border-b border-black/5 text-[#C5A059] font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C5A059] animate-bounce" />
                AI Luxury Stylist
              </button>
            </li>
            <li>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-sans uppercase tracking-[0.2em]">Select Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#FAF9F6] border border-black/5 text-xs px-2 py-1 focus:outline-none"
                >
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol.trim()})
                    </option>
                  ))}
                </select>
              </div>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

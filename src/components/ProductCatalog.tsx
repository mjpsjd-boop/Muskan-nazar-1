import React, { useState, useMemo } from "react";
import { Filter, SlidersHorizontal, Heart, Sparkles, RefreshCw, Star, Info } from "lucide-react";
import { Product } from "../types";

interface ProductCatalogProps {
  products: Product[];
  currentCategory: string;
  setCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currency: string;
  formatPrice: (price: number) => string;
  categories?: string[];
}

export default function ProductCatalog({
  products,
  currentCategory,
  setCategory,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  currency,
  formatPrice,
  categories = ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"]
}: ProductCatalogProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedEmbroidery, setSelectedEmbroidery] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const maxPriceValue = useMemo(() => {
    if (products.length === 0) return 1000000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  const [priceRange, setPriceRange] = useState<number>(1000000);

  React.useEffect(() => {
    if (maxPriceValue > 0) {
      setPriceRange(maxPriceValue);
    }
  }, [maxPriceValue]);

  const [sortBy, setSortBy] = useState<string>("featured");

  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  // Available Filter Options gathered from static analysis
  const colorOptions = ["Red", "Gold", "Blue", "Ivory", "Champagne", "Silver", "Emerald", "Teal", "Blush Pink"];
  const fabricOptions = ["Raw Silk", "Organza", "Velvet", "Tissue", "Net", "Crushed Organza"];
  const embroideryOptions = ["Zardozi", "Tilla", "Gota", "Dabka", "Sequins", "Mirrors", "Crystals"];
  const sizeOptions = ["XS", "S", "M", "L", "XL", "Custom"];

  const handleFilterToggle = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleResetFilters = () => {
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedEmbroidery([]);
    setSelectedSizes([]);
    setPriceRange(maxPriceValue);
    setCategory("All");
  };

  // Advanced client-side search/filtering engine
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. Category Filter
      if (currentCategory !== "All" && prod.category !== currentCategory) {
        return false;
      }

      // 2. Max Price Filter
      if (prod.price > priceRange) {
        return false;
      }

      // 3. Color Filter (any matching color)
      if (selectedColors.length > 0) {
        const hasColor = prod.colors.some(c =>
          selectedColors.some(sc => c.toLowerCase().includes(sc.toLowerCase()))
        );
        if (!hasColor) return false;
      }

      // 4. Fabric Filter
      if (selectedFabrics.length > 0) {
        const hasFabric = prod.fabrics.some(f =>
          selectedFabrics.some(sf => f.toLowerCase().includes(sf.toLowerCase()))
        );
        if (!hasFabric) return false;
      }

      // 5. Embroidery Filter
      if (selectedEmbroidery.length > 0) {
        const hasEmbroidery = prod.embroidery.some(e =>
          selectedEmbroidery.some(se => e.toLowerCase().includes(se.toLowerCase()))
        );
        if (!hasEmbroidery) return false;
      }

      // 6. Size Filter
      if (selectedSizes.length > 0) {
        const hasSize = prod.sizes.some(s => selectedSizes.includes(s));
        if (!hasSize) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // Default Featured
    });
  }, [products, currentCategory, selectedColors, selectedFabrics, selectedEmbroidery, selectedSizes, priceRange, sortBy]);

  return (
    <section id="products" className="py-24 bg-[#FAF9F6] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            THE CATALOGUE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-[#121212] font-light mb-4">
            {currentCategory === "All" ? "Bespoke & Ready-to-Wear Collection" : `${currentCategory}`}
          </h2>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-4"></div>
          <p className="font-sans text-xs text-gray-500 uppercase tracking-widest">
            {filteredProducts.length} Premium masterpieces found
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/5 pb-4 mb-10 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#121212] border border-black/5 px-4 py-2 hover:border-[#C5A059] transition-all bg-white"
            >
              <Filter className="w-4 h-4 text-[#C5A059]" />
              <span>Filters Suite</span>
            </button>
            {(selectedColors.length > 0 || selectedFabrics.length > 0 || selectedEmbroidery.length > 0 || selectedSizes.length > 0 || currentCategory !== "All") && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold hover:text-black transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <span className="text-[11px] font-sans text-gray-400 uppercase tracking-[0.2em]">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-black/5 text-xs font-sans tracking-[0.1em] py-2 px-4 focus:outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="featured">Featured Masterpieces</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Client Rating</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar (Collapsible in desktop, dropdown in mobile) */}
          {isFilterMobileOpen && (
            <div className="lg:col-span-3 bg-white border border-black/5 p-6 space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-black/5 pb-3">
                <h4 className="font-serif text-sm uppercase tracking-[0.2em] font-semibold text-[#121212]">Filter Suite</h4>
                <button onClick={() => setIsFilterMobileOpen(false)} className="text-xs uppercase text-[#C5A059] font-bold hover:text-black">Hide</button>
              </div>

              {/* Category selector */}
              <div>
                <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C5A059] mb-3 font-semibold">Category</h5>
                <div className="space-y-1.5">
                  {["All", ...categories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`block text-left text-xs tracking-wide py-1 font-sans w-full transition-colors ${
                        currentCategory === cat ? "text-[#C5A059] font-semibold pl-1" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold">Max Value</h5>
                  <span className="font-mono text-xs text-[#121212] font-medium">{formatPrice(priceRange)}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(maxPriceValue / 100)}
                  max={maxPriceValue}
                  step={Math.round(maxPriceValue / 100)}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-[#C5A059]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                  <span>{formatPrice(Math.round(maxPriceValue / 100))}</span>
                  <span>{formatPrice(maxPriceValue)}</span>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C5A059] mb-3 font-semibold">Preferred Colors</h5>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((col) => (
                    <button
                      key={col}
                      onClick={() => handleFilterToggle(selectedColors, col, setSelectedColors)}
                      className={`px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-all ${
                        selectedColors.includes(col)
                          ? "bg-[#121212] text-white border-black font-semibold"
                          : "bg-[#FAF9F6] text-gray-600 border-black/5 hover:border-black"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              <div>
                <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C5A059] mb-3 font-semibold">Artisan Fabrics</h5>
                <div className="space-y-2">
                  {fabricOptions.map((fab) => (
                    <label key={fab} className="flex items-center gap-2 cursor-pointer text-xs font-sans text-gray-600 hover:text-black">
                      <input
                        type="checkbox"
                        checked={selectedFabrics.includes(fab)}
                        onChange={() => handleFilterToggle(selectedFabrics, fab, setSelectedFabrics)}
                        className="rounded border-black/5 text-[#C5A059] focus:ring-[#C5A059]"
                      />
                      <span>{fab}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Embroidery */}
              <div>
                <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C5A059] mb-3 font-semibold">Embellishment Styles</h5>
                <div className="space-y-2">
                  {embroideryOptions.map((emb) => (
                    <label key={emb} className="flex items-center gap-2 cursor-pointer text-xs font-sans text-gray-600 hover:text-black">
                      <input
                        type="checkbox"
                        checked={selectedEmbroidery.includes(emb)}
                        onChange={() => handleFilterToggle(selectedEmbroidery, emb, setSelectedEmbroidery)}
                        className="rounded border-black/5 text-[#C5A059] focus:ring-[#C5A059]"
                      />
                      <span>{emb}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizing options */}
              <div>
                <h5 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#C5A059] mb-3 font-semibold">Sizes</h5>
                <div className="flex gap-1.5 flex-wrap">
                  {sizeOptions.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleFilterToggle(selectedSizes, sz, setSelectedSizes)}
                      className={`w-9 h-9 text-xs flex justify-center items-center font-mono border transition-all ${
                        selectedSizes.includes(sz)
                          ? "bg-[#C5A059] text-white border-[#C5A059]"
                          : "bg-white text-gray-600 border-black/5 hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className={`${isFilterMobileOpen ? "lg:col-span-9" : "lg:col-span-12"} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8`}>
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white border border-black/5">
                <Info className="w-10 h-10 text-[#C5A059] mx-auto mb-3" />
                <p className="font-serif text-lg text-gray-800 mb-2">No Matching Couture Found</p>
                <p className="font-sans text-xs text-gray-500 mb-4">Try adjusting your filters, or request custom design with our AI consultant.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 border border-black text-black hover:bg-black hover:text-white font-sans text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors"
                >
                  Clear Filter suite
                </button>
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const isWishlisted = wishlist.includes(prod.id);
                const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;
                const discountPct = hasDiscount ? Math.round(((prod.originalPrice! - prod.price) / prod.originalPrice!) * 100) : 0;

                return (
                  <div
                    key={prod.id}
                    className="group flex flex-col justify-between bg-white border border-black/5 hover:border-[#C5A059] transition-all duration-300 relative"
                  >
                    {/* Discount badge */}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-[#C5A059] text-white text-[9px] font-mono tracking-widest uppercase px-2 py-1 z-10">
                        -{discountPct}% OFF
                      </span>
                    )}

                    {/* Stock indicator */}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-black text-[9px] font-mono tracking-widest uppercase px-2 py-1 z-10 border border-black/5">
                      {prod.category === "Ready-to-Wear" ? "READY SHIP" : "CUSTOM TAILORED"}
                    </span>

                    {/* Image Area */}
                    <div className="relative overflow-hidden aspect-[4/5] bg-gray-50 cursor-pointer" onClick={() => onSelectProduct(prod)}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-all duration-700 grayscale-[5%]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-end p-4">
                        <button className="w-full py-3 bg-white/90 hover:bg-black hover:text-white text-black font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-300 font-semibold shadow-md translate-y-2 group-hover:translate-y-0">
                          View Couture Details
                        </button>
                      </div>
                    </div>

                    {/* Detail Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="font-mono text-[9px] text-[#C5A059] tracking-[0.25em] uppercase font-semibold">
                            {prod.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-mono text-[10px] font-semibold text-gray-800">{prod.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <h3 className="font-serif text-[14px] sm:text-[15px] font-light uppercase tracking-wide text-gray-900 group-hover:text-[#C5A059] transition-colors line-clamp-1 mb-2">
                          {prod.name}
                        </h3>

                        <p className="font-sans text-[11px] text-gray-500 font-light tracking-wide line-clamp-2 leading-relaxed mb-4">
                          {prod.description}
                        </p>
                      </div>

                      <div className="border-t border-black/5 pt-3 flex justify-between items-center">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[13px] font-medium text-[#121212]">
                            {formatPrice(prod.price)}
                          </span>
                          {hasDiscount && (
                            <span className="font-mono text-xs text-gray-400 line-through">
                              {formatPrice(prod.originalPrice!)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(prod.id);
                          }}
                          className="p-2 hover:bg-[#FAF9F6] rounded-full transition-colors group/heart"
                          title="Add to Wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 transition-all duration-300 ${
                              isWishlisted
                                ? "fill-red-500 text-red-500 scale-110"
                                : "text-gray-400 group-hover/heart:text-red-500"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Craftsmanship from "./components/Craftsmanship";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetails from "./components/ProductDetails";
import BespokeSuite from "./components/BespokeSuite";
import AiStylist from "./components/AiStylist";
import CartDrawer from "./components/CartDrawer";
import AdminDashboard from "./components/AdminDashboard";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

// Import our custom-crafted premium pages
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import ReviewsPage from "./components/ReviewsPage";
import CheckoutPage from "./components/CheckoutPage";
import AccountPage from "./components/AccountPage";
import BottomNavigation from "./components/BottomNavigation";

import { Product, CustomDressRequest, Order, User } from "./types";
import { Sparkles, Trash2, Heart, ShoppingBag, ArrowRight } from "lucide-react";

export default function App() {
  // Sync States with Express server
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"]);
  const [customRequests, setCustomRequests] = useState<CustomDressRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Applet interactive configurations
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [currentCategory, setCategory] = useState<string>("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Open / Close Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiStylistOpen, setIsAiStylistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Custom Admin Password Modal States
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

  const handleToggleAdmin = () => {
    if (isAdminOpen) {
      setIsAdminOpen(false);
    } else {
      setAdminPasswordInput("");
      setAdminPasswordError("");
      setShowAdminPasswordModal(true);
    }
  };

  const handleVerifyAdminPassword = () => {
    if (adminPasswordInput === "muskannazar@123") {
      setIsAdminOpen(true);
      setShowAdminPasswordModal(false);
      setAdminPasswordError("");
    } else {
      setAdminPasswordError("Invalid credentials. Access Denied.");
    }
  };

  // Default Currency to Indian Rupee (₹ INR) as requested by user
  const [currency, setCurrency] = useState("INR");

  const exchangeRates: Record<string, { rate: number; symbol: string }> = {
    INR: { rate: 1.0, symbol: "₹" },
    USD: { rate: 0.012, symbol: "$" },
    EUR: { rate: 0.011, symbol: "€" },
    GBP: { rate: 0.0094, symbol: "£" },
    AED: { rate: 0.044, symbol: "AED " }
  };

  const formatPrice = useCallback((price: number) => {
    const config = exchangeRates[currency] || exchangeRates.INR;
    const converted = Math.round(price * config.rate);
    return `${config.symbol}${converted.toLocaleString()}`;
  }, [currency]);

  // Fetch initial collections and inventories from Server
  const fetchAllServerData = async () => {
    try {
      const [resProd, resBespoke, resOrders, resCats] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/bespoke/requests"),
        fetch("/api/orders"),
        fetch("/api/categories")
      ]);

      if (resProd.ok) {
        const data = await resProd.json();
        setProducts(data);
      }
      if (resBespoke.ok) {
        const data = await resBespoke.json();
        setCustomRequests(data);
      }
      if (resOrders.ok) {
        const data = await resOrders.json();
        setOrders(data);
      }
      if (resCats.ok) {
        const data = await resCats.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching full-stack server endpoints, using local memory instead:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllServerData();
  }, []);

  // Sync custom requests and orders periodically or when Admin panel toggles
  useEffect(() => {
    if (isAdminOpen) {
      fetchAllServerData();
    }
  }, [isAdminOpen]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Wishlist controls
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Cart controls
  const handleAddToCart = (item: any) => {
    setCartItems((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Admin addition controls
  const handleAddProductAdmin = async (newProd: any) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProductAdmin = async (id: string, updatedProd: any) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProd)
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProductAdmin = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategoryAdmin = async (name: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategoryAdmin = async (oldName: string, newName: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName })
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategoryAdmin = async (name: string) => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBespokeStatusAdmin = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/bespoke/requests"); // fetch list
      if (res.ok) {
        setCustomRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: status as any } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatusAdmin = async (id: string, updateFields: any) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateFields)
      });
      if (res.ok) {
        fetchAllServerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scrolling anchor helper
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Dedicated Wishlist Page Component
  const renderWishlistPage = () => {
    const itemsInWishlist = products.filter((p) => wishlist.includes(p.id));

    return (
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 animate-fade-in min-h-[60vh]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[10px] text-[#C5A059] uppercase tracking-[0.4em] font-semibold">Saved Masterpieces</span>
          <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-widest text-[#121212] mt-2 font-light">My Atelier Wishlist</h2>
          <div className="h-[1px] w-20 bg-[#C5A059] mx-auto mt-4"></div>
        </div>

        {itemsInWishlist.length === 0 ? (
          <div className="text-center py-20 bg-white border border-black/5 p-10 max-w-md mx-auto rounded-sm shadow-xs">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-4 stroke-1" />
            <p className="text-sm font-sans text-gray-500 uppercase tracking-widest font-semibold">Your Wishlist is Empty</p>
            <p className="text-xs font-sans text-gray-400 mt-2">Explore our collections and save garments you adore.</p>
            <button
              onClick={() => setCurrentPage("collections")}
              className="mt-6 px-6 py-3 bg-[#121212] text-white text-[11px] uppercase tracking-widest hover:bg-[#C5A059] transition-all duration-300 font-bold"
            >
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {itemsInWishlist.map((product) => (
              <div key={product.id} className="bg-white border border-black/5 group overflow-hidden relative">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <button
                    onClick={() => handleToggleWishlist(product.id)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 text-center space-y-2">
                  <span className="font-mono text-[9px] uppercase text-[#C5A059] tracking-widest">{product.category}</span>
                  <h4 className="font-serif text-sm uppercase text-[#121212] tracking-wider font-semibold">{product.name}</h4>
                  <p className="font-mono text-xs text-gray-600 font-medium">{formatPrice(product.price)}</p>
                  
                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 py-2.5 border border-black text-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300 font-bold"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart({
                        id: product.id,
                        productName: product.name,
                        price: product.price,
                        image: product.image,
                        selectedColor: product.colors?.[0] || "Ivory",
                        selectedFabric: product.fabrics?.[0] || "Pure Silk",
                        selectedSize: "S",
                        quantity: 1
                      })}
                      className="flex-1 py-2.5 bg-[#C5A059] text-white text-[10px] uppercase tracking-widest hover:bg-black transition-colors duration-300 font-bold"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Dedicated Cart Page Component
  const renderCartPage = () => {
    const subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    return (
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 animate-fade-in min-h-[60vh]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[10px] text-[#C5A059] uppercase tracking-[0.4em] font-semibold">Atelier Bag</span>
          <h2 className="font-serif text-3xl sm:text-4xl uppercase tracking-widest text-[#121212] mt-2 font-light">My Shopping Cart</h2>
          <div className="h-[1px] w-20 bg-[#C5A059] mx-auto mt-4"></div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-black/5 p-10 max-w-md mx-auto rounded-sm">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-4 stroke-1" />
            <p className="text-sm font-sans text-gray-500 uppercase tracking-widest font-semibold">Your Cart is Empty</p>
            <p className="text-xs font-sans text-gray-400 mt-2">Explore our custom formals and pick your favorites.</p>
            <button
              onClick={() => setCurrentPage("collections")}
              className="mt-6 px-6 py-3 bg-[#121212] text-white text-[11px] uppercase tracking-widest hover:bg-[#C5A059] transition-all duration-300 font-bold"
            >
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white border border-black/5 p-6 space-y-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 sm:gap-6 py-4 border-b border-black/5 last:border-b-0 justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <img src={item.image} alt={item.productName} className="w-16 h-20 object-cover border border-black/5" />
                    <div>
                      <span className="text-[9px] font-mono uppercase text-[#C5A059] tracking-widest">Size: {item.selectedSize}</span>
                      <h4 className="font-serif text-xs uppercase text-[#121212] tracking-wider font-bold mt-0.5">{item.productName}</h4>
                      <p className="text-[10px] text-gray-500 font-sans mt-1">Color: {item.selectedColor} | Fabric: {item.selectedFabric}</p>
                      <p className="text-xs font-mono text-[#121212] font-semibold mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-black/10">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            setCartItems(prev => prev.map((itm, i) => i === index ? { ...itm, quantity: itm.quantity - 1 } : itm));
                          } else {
                            handleRemoveCartItem(index);
                          }
                        }}
                        className="px-2 py-1 text-xs hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono text-xs">{item.quantity}</span>
                      <button
                        onClick={() => {
                          setCartItems(prev => prev.map((itm, i) => i === index ? { ...itm, quantity: itm.quantity + 1 } : itm));
                        }}
                        className="px-2 py-1 text-xs hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveCartItem(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="bg-[#FAF9F6] border border-black/5 p-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-600 uppercase tracking-wider">
                <span>Atelier Bag Subtotal</span>
                <span className="font-mono text-black font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 uppercase tracking-wider">
                <span>GST (18% Inclusive)</span>
                <span className="font-mono text-green-700 font-semibold">Included</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 uppercase tracking-wider">
                <span>Shipping Fee</span>
                <span className="font-mono text-green-700 font-semibold">Complimentary</span>
              </div>
              <div className="border-t border-black/10 pt-4 flex justify-between items-center">
                <span className="font-serif text-sm uppercase tracking-wider text-black font-bold">Total Payable</span>
                <span className="font-mono text-lg text-black font-bold">{formatPrice(subtotal)}</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setCurrentPage("checkout")}
                  className="w-full py-4 bg-[#121212] text-white hover:bg-[#C5A059] transition-all duration-300 font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                >
                  <span>Advance to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#121212] flex flex-col justify-between">
      
      {/* Universal Luxury Navigation */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentCategory={currentCategory}
        setCategory={setCategory}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
        onOpenAiStylist={() => setIsAiStylistOpen(true)}
        onToggleAdmin={handleToggleAdmin}
        isAdminOpen={isAdminOpen}
        currency={currency}
        setCurrency={setCurrency}
        wishlistCount={wishlist.length}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main viewport with dynamic page routing */}
      <main className="flex-1">
        {isAdminOpen ? (
          <AdminDashboard
            products={products}
            onAddProduct={handleAddProductAdmin}
            onUpdateProduct={handleUpdateProductAdmin}
            onDeleteProduct={handleDeleteProductAdmin}
            customRequests={customRequests}
            onUpdateBespokeStatus={handleUpdateBespokeStatusAdmin}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatusAdmin}
            formatPrice={formatPrice}
            categories={categories}
            onAddCategory={handleAddCategoryAdmin}
            onUpdateCategory={handleUpdateCategoryAdmin}
            onDeleteCategory={handleDeleteCategoryAdmin}
            onRefreshData={fetchAllServerData}
          />
        ) : (
          <div className="space-y-0">
            {currentPage === "home" && (
              <>
                {/* 1. Cinematic Hero */}
                <Hero
                  onExploreCouture={() => setCurrentPage("collections")}
                  onOpenBespoke={() => setCurrentPage("bespoke")}
                />
                {/* 2. Brand Craftsmanship Bento Grid */}
                <Craftsmanship />
                {/* 3. Catalog Preview */}
                <ProductCatalog
                  products={products}
                  currentCategory="All"
                  setCategory={setCategory}
                  onSelectProduct={setSelectedProduct}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  currency={currency}
                  formatPrice={formatPrice}
                  categories={categories}
                />
                {/* 4. Bespoke Atelier Suite */}
                <BespokeSuite
                  currency={currency}
                  formatPrice={formatPrice}
                />
                {/* 5. Editorial Testimonials */}
                <Testimonials />
              </>
            )}

            {currentPage === "collections" && (
              <ProductCatalog
                products={products}
                currentCategory={currentCategory}
                setCategory={setCategory}
                onSelectProduct={setSelectedProduct}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                currency={currency}
                formatPrice={formatPrice}
                categories={categories}
              />
            )}

            {currentPage === "bespoke" && (
              <BespokeSuite
                currency={currency}
                formatPrice={formatPrice}
              />
            )}

            {currentPage === "bridal" && (
              <ProductCatalog
                products={products}
                currentCategory="Bridals"
                setCategory={setCategory}
                onSelectProduct={setSelectedProduct}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                currency={currency}
                formatPrice={formatPrice}
                categories={categories}
              />
            )}

            {currentPage === "luxury-formals" && (
              <ProductCatalog
                products={products}
                currentCategory="Luxury Formals"
                setCategory={setCategory}
                onSelectProduct={setSelectedProduct}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                currency={currency}
                formatPrice={formatPrice}
                categories={categories}
              />
            )}

            {currentPage === "about" && (
              <AboutPage />
            )}

            {currentPage === "reviews" && (
              <ReviewsPage
                products={products}
                currency={currency}
                formatPrice={formatPrice}
              />
            )}

            {currentPage === "contact" && (
              <ContactPage />
            )}

            {currentPage === "account" && (
              <AccountPage
                products={products}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                currency={currency}
                formatPrice={formatPrice}
                setCurrentPage={setCurrentPage}
                wishlist={wishlist}
                handleToggleWishlist={handleToggleWishlist}
              />
            )}

            {currentPage === "wishlist" && renderWishlistPage()}

            {currentPage === "cart" && renderCartPage()}

            {currentPage === "checkout" && (
              <CheckoutPage
                cartItems={cartItems}
                currency={currency}
                formatPrice={formatPrice}
                onClearCart={handleClearCart}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Bottom Footer */}
      <Footer />

      {/* Persistent Glassmorphism Floating Navigation Overlay */}
      <BottomNavigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartCount={cartItems.length}
        wishlistCount={wishlist.length}
        isAdminOpen={isAdminOpen}
        onToggleAdmin={handleToggleAdmin}
      />

      {/* Slide-in Cart Drawer Panel for micro-interactions */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        currency={currency}
        formatPrice={formatPrice}
        onClearCart={handleClearCart}
      />

      {/* Slide-in Personal AI Stylist Concierge */}
      <AiStylist
        isOpen={isAiStylistOpen}
        onClose={() => setIsAiStylistOpen(false)}
      />

      {/* Full-screen Product Detail and Customizing suite */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          currency={currency}
          formatPrice={formatPrice}
        />
      )}

      {/* Custom Admin Password Modal */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-[#FAF9F6] border border-[#C5A059]/40 max-w-sm w-full p-8 rounded-none shadow-2xl relative space-y-6">
            <div className="text-center">
              <span className="font-mono text-[9px] text-[#C5A059] uppercase tracking-[0.4em] font-semibold">Security Portal</span>
              <h3 className="font-serif text-xl uppercase tracking-widest text-black mt-2 font-light">Atelier Entry</h3>
              <p className="text-[11px] text-gray-500 font-sans mt-2 tracking-wide leading-relaxed">Enter your authorized credential to unlock the house ledger.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-sans uppercase tracking-widest text-[#C5A059] font-semibold mb-1.5">Secret Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminPasswordError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyAdminPassword();
                    }
                  }}
                  className="w-full bg-white border border-black/10 px-4 py-2.5 text-xs text-black focus:outline-none focus:border-[#C5A059] font-mono tracking-widest"
                  autoFocus
                />
              </div>

              {adminPasswordError && (
                <p className="text-[11px] text-red-600 font-sans tracking-wide text-center bg-red-50 py-2 border border-red-100">{adminPasswordError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAdminPasswordModal(false)}
                  className="flex-1 py-2.5 border border-black/10 text-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors font-sans font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAdminPassword}
                  className="flex-1 py-2.5 bg-[#121212] hover:bg-[#C5A059] text-white text-[10px] uppercase tracking-widest transition-colors font-sans font-bold cursor-pointer"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

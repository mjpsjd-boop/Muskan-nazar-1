import React, { useState, useEffect } from "react";
import { User, LogIn, Mail, ShieldAlert, KeyRound, MapPin, Sliders, Heart, ShoppingBag, Eye, LogOut, CheckCircle2, Trash, Plus, Sparkles, Receipt, Undo2 } from "lucide-react";
import { User as UserType, Order, Measurement, Product } from "../types";

interface AccountPageProps {
  products: Product[];
  currentUser: UserType | null;
  setCurrentUser: (user: UserType | null) => void;
  currency: string;
  formatPrice: (price: number) => string;
  setCurrentPage: (page: string) => void;
  wishlist: string[];
  handleToggleWishlist: (productId: string) => void;
}

export default function AccountPage({
  products,
  currentUser,
  setCurrentUser,
  currency,
  formatPrice,
  setCurrentPage,
  wishlist,
  handleToggleWishlist
}: AccountPageProps) {
  // Login / Register Form state
  const [isRegister, setIsRegister] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Authenticated Dashboard tabs: 'profile' | 'addresses' | 'measurements' | 'orders' | 'wishlist'
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'measurements' | 'orders' | 'wishlist'>('orders');

  // Multi-address book helper
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("Delhi");
  const [newZipCode, setNewZipCode] = useState("");
  const [newCountry, setNewCountry] = useState("India");

  // Profile fields editing
  const [editName, setEditName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  // Measurements fields
  const [measurements, setMeasurements] = useState<Measurement>({
    height: "",
    bust: "",
    waist: "",
    hips: "",
    shoulderWidth: "",
    sleeveLength: "",
    dressLength: ""
  });

  // Client-side orders list
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Return popover
  const [returningOrder, setReturningOrder] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("Fitting adjustment");
  const [returnComment, setReturnComment] = useState("");

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || "");
      setProfilePic(currentUser.profilePicture || "");
      if (currentUser.measurements) {
        setMeasurements({
          height: currentUser.measurements.height || "",
          bust: currentUser.measurements.bust || "",
          waist: currentUser.measurements.waist || "",
          hips: currentUser.measurements.hips || "",
          shoulderWidth: currentUser.measurements.shoulderWidth || "",
          sleeveLength: currentUser.measurements.sleeveLength || "",
          dressLength: currentUser.measurements.dressLength || ""
        });
      }
      fetchCustomerOrders();
    }
  }, [currentUser]);

  const fetchCustomerOrders = async () => {
    if (!currentUser) return;
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data: Order[] = await res.json();
        const userOrders = data.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
        setCustomerOrders(userOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setLoading(true);

    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister 
      ? { name: formName, email: formEmail, password: formPassword } 
      : { email: formEmail, password: formPassword };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          setFormSuccess("Account created successfully! Please log in now.");
          setIsRegister(false);
          setFormPassword("");
        } else {
          setCurrentUser(data.user);
          setFormSuccess("Welcome to Muskan Nazar Atelier.");
        }
      } else {
        setFormError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setFormError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedFields: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          ...updatedFields
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setFormSuccess("Atelier Profile updated successfully!");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  // Profile Picture Upload helper (Base64)
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        handleUpdateProfile({ profilePicture: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Multi-Address logic
  const handleAddAddress = () => {
    if (!newStreet || !newCity || !newZipCode) return;
    const newAddr = {
      street: newStreet,
      city: newCity,
      state: newState,
      zipCode: newZipCode,
      country: newCountry
    };
    const updated = [...(currentUser?.addresses || []), newAddr];
    handleUpdateProfile({ addresses: updated });
    // Reset
    setNewStreet("");
    setNewCity("");
    setNewZipCode("");
  };

  const handleDeleteAddress = (idx: number) => {
    const updated = (currentUser?.addresses || []).filter((_, i) => i !== idx);
    handleUpdateProfile({ addresses: updated });
  };

  // Sizing silhouette
  const handleSaveMeasurements = () => {
    handleUpdateProfile({ measurements });
  };

  // Return creation logic
  const handleInitiateReturn = async () => {
    if (!returningOrder) return;
    try {
      const res = await fetch(`/api/orders/${returningOrder}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason, comment: returnComment })
      });
      if (res.ok) {
        setReturningOrder(null);
        setReturnComment("");
        fetchCustomerOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("home");
  };

  if (!currentUser) {
    return (
      <div className="py-12 bg-[#FAF9F6] text-[#121212] select-none flex items-center justify-center min-h-[75vh]">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white border border-black/5 rounded-sm shadow-sm overflow-hidden">
          
          {/* Visual Editorial sidebar */}
          <div className="hidden md:block bg-neutral-900 relative">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
              alt="Luxury drape model"
              className="w-full h-full object-cover grayscale-[20%] opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#121212]/40 flex flex-col justify-end p-10 text-[#FAF9F6] space-y-3">
              <span className="font-mono text-[9px] tracking-widest text-[#C5A059] uppercase font-semibold">THE ATELIER CIRCLE</span>
              <h2 className="font-serif text-3xl font-light uppercase leading-tight">Muskan Nazar Couture Member</h2>
              <p className="font-sans text-xs opacity-85 font-light leading-relaxed">
                Log in or register to save your bespoke silhouette measurements, track your pending bridal orders, download GST-ready invoices, and secure priority seasonal drop access.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
            <div className="text-center md:text-left space-y-1">
              <span className="font-mono text-[10px] text-[#C5A059] tracking-widest uppercase font-semibold">SECURITY PORTAL</span>
              <h1 className="font-serif text-2xl uppercase tracking-wide">
                {isRegister ? "Join the Couture Circle" : "Log In to Atelier"}
              </h1>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 font-sans text-xs">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {isRegister && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Password *</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setFormSuccess("A password reset instruction prompt has been sent to your email.")}
                      className="text-[10px] text-gray-400 hover:text-[#C5A059] cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#121212] hover:bg-[#C5A059] text-white py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:bg-gray-400"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{loading ? "VERIFYING CREDENTIALS..." : isRegister ? "REGISTER ACCOUNT" : "LOG IN Securely"}</span>
              </button>
            </form>

            <div className="border-t border-black/5 pt-4 text-center font-sans text-[11px] text-gray-500">
              {isRegister ? (
                <p>Already have an Atelier account? <button onClick={() => setIsRegister(false)} className="text-[#C5A059] font-bold cursor-pointer">Log In</button></p>
              ) : (
                <p>New to Muskan Nazar? <button onClick={() => setIsRegister(true)} className="text-[#C5A059] font-bold cursor-pointer">Create Account</button></p>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF9F6] text-[#121212] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* User Banner Card */}
        <div className="bg-white border border-black/5 p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-[#C5A059] bg-neutral-100 flex items-center justify-center">
              {profilePic ? (
                <img src={profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#C5A059]" />
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-sans font-semibold tracking-wider uppercase cursor-pointer transition-opacity">
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="font-serif text-xl font-light text-gray-900">{currentUser.name}</h2>
                <span className="text-[10px] uppercase font-semibold text-[#C5A059] bg-[#FAF9F6] px-1.5 py-0.5 border border-[#C5A059]/20 rounded-sm">
                  {currentUser.role === "admin" ? "Staff Administrator" : "Couture Patron"}
                </span>
              </div>
              <p className="font-mono text-[10px] text-gray-400 font-light">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-black/10 hover:border-[#C5A059] px-4 py-2.5 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer text-gray-600 hover:text-black"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Log out</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Navigation panel */}
          <div className="bg-white border border-black/5 p-4 rounded-sm space-y-1">
            <p className="font-mono text-[9px] text-[#C5A059] tracking-widest uppercase font-semibold pl-3 pb-2 border-b border-black/5 mb-2">Member Command</p>
            {[
              { id: "orders", label: "Order Progress & History", icon: ShoppingBag },
              { id: "measurements", label: "Silhouette Measurements", icon: Sliders },
              { id: "addresses", label: "Worldwide Address Book", icon: MapPin },
              { id: "wishlist", label: "Atelier Saved Favorites", icon: Heart },
              { id: "profile", label: "Aesthetic Profile Info", icon: User }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-sm font-sans text-xs text-left cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[#C5A059] text-white font-semibold"
                      : "text-gray-600 hover:bg-neutral-50 hover:text-black"
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active view window */}
          <div className="lg:col-span-3 bg-white border border-black/5 p-6 sm:p-8 rounded-sm min-h-[50vh]">
            
            {/* View 1: Order Progress */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900 font-light border-b border-black/5 pb-3">
                  Atelier Order Console
                </h3>

                {loadingOrders ? (
                  <div className="text-center py-12 text-xs font-mono tracking-widest text-[#C5A059] animate-pulse">
                    PULLING ATELIER COUTURE LEDGERS...
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-widest font-semibold">No order files recorded</p>
                    <p className="font-sans text-[11px] text-gray-500 font-light max-w-xs mx-auto">You have not completed any bespoke or ready-to-wear orders in this account cycle yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="border border-black/5 rounded-sm p-5 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/5 pb-3 gap-3">
                          <div className="space-y-0.5">
                            <p className="font-sans text-[10px] text-gray-400">Order ID: <span className="font-mono font-bold text-gray-800">{order.id}</span></p>
                            <p className="font-sans text-[10px] text-gray-400">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-yellow-50 text-amber-700 border border-amber-200/50 px-2 py-1 rounded-sm">
                              Status: {order.shippingStatus}
                            </span>
                            <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-200/50 px-2 py-1 rounded-sm">
                              Payment: {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <div>
                                <p className="font-serif font-bold text-gray-900">{item.productName}</p>
                                <p className="font-sans text-[10px] text-gray-500">
                                  Color: {item.selectedColor} | Fabric: {item.selectedFabric} | Size: {item.selectedSize}
                                </p>
                              </div>
                              <span className="font-sans font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons (Returns & Invoices) */}
                        <div className="border-t border-black/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          <div className="font-sans font-bold text-gray-900">
                            Total Ledger: {formatPrice(order.totalAmount)}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.invoiceUrl && (
                              <a
                                href={order.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 border border-black/10 hover:border-[#C5A059] px-3 py-1.5 rounded-sm font-sans font-semibold text-[10px] uppercase tracking-wider text-gray-700 hover:text-black transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5 text-[#C5A059]" />
                                <span>Invoice (GST)</span>
                              </a>
                            )}

                            {order.shippingStatus === "Delivered" && (
                              <button
                                onClick={() => setReturningOrder(order.id)}
                                className="flex items-center gap-1.5 border border-red-200/50 bg-red-50/20 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-sm font-sans font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                <span>Initiate Fitting Return</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Return overlay panel */}
                        {returningOrder === order.id && (
                          <div className="mt-4 p-4 bg-[#FAF9F6] border border-red-200 rounded-sm space-y-3 font-sans text-xs">
                            <h4 className="font-bold text-red-900 uppercase tracking-wide">Initiate Fitting Claim</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Adjustment Reason</label>
                                <select
                                  value={returnReason}
                                  onChange={(e) => setReturnReason(e.target.value)}
                                  className="w-full bg-white border border-black/5 px-2 py-1.5 rounded-sm text-gray-800"
                                >
                                  <option value="Fitting adjustment">Fitting adjustment (Too loose/tight)</option>
                                  <option value="Sleeve/Collar Alteration">Sleeve/Collar Alteration</option>
                                  <option value="Fabric color correction">Fabric color mismatch</option>
                                  <option value="Other">Other customized fitting query</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 uppercase tracking-widest">Detail instructions for tailoring team</label>
                              <textarea
                                value={returnComment}
                                onChange={(e) => setReturnComment(e.target.value)}
                                placeholder="Explain any measurements discrepancies clearly..."
                                rows={2}
                                className="w-full bg-white border border-black/5 px-2 py-1.5 rounded-sm text-gray-800 resize-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setReturningOrder(null)} className="px-3 py-1.5 text-gray-500 border border-black/5 hover:border-black rounded-sm cursor-pointer">Cancel</button>
                              <button onClick={handleInitiateReturn} className="px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-sm cursor-pointer">Submit Tailor Return</button>
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 2: Silhouette Measurements */}
            {activeTab === "measurements" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900 font-light pb-2 border-b border-black/5">
                    Bespoke Silhouette Engine
                  </h3>
                  <p className="font-sans text-[11px] text-gray-400 font-light leading-relaxed">
                    Save your custom body measurements securely here. When submitting bespoke lehengas or custom bridal gowns, our Lucknow tailoring suite pulls these configurations instantly to construct a flawless fit.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs font-sans">
                  {[
                    { key: "height", label: "Full Height (ft/in)", placeholder: "e.g., 5ft 6in" },
                    { key: "bust", label: "Bust Line (inches)", placeholder: "e.g., 34" },
                    { key: "waist", label: "Waist Line (inches)", placeholder: "e.g., 27" },
                    { key: "hips", label: "Lower Hips (inches)", placeholder: "e.g., 38" },
                    { key: "shoulderWidth", label: "Shoulder Width (inches)", placeholder: "e.g., 15" },
                    { key: "sleeveLength", label: "Sleeve Length (inches)", placeholder: "e.g., 22" },
                    { key: "dressLength", label: "Ideal Dress Length (inches)", placeholder: "e.g., 58" }
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={(measurements as any)[field.key] || ""}
                        onChange={(e) => setMeasurements({ ...measurements, [field.key]: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveMeasurements}
                  className="bg-[#121212] hover:bg-[#C5A059] text-white px-6 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 cursor-pointer mt-4"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Lock In Custom Proportions</span>
                </button>
              </div>
            )}

            {/* View 3: Address Book */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900 font-light border-b border-black/5 pb-3">
                  Atelier Address Registry
                </h3>

                {/* List */}
                <div className="space-y-4">
                  {!currentUser.addresses || currentUser.addresses.length === 0 ? (
                    <p className="font-sans text-xs text-gray-400 font-light italic">No shipping addresses cataloged yet. Please add a destination below.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentUser.addresses.map((addr, idx) => (
                        <div key={idx} className="border border-black/5 p-4 rounded-sm space-y-3 relative">
                          <button
                            onClick={() => handleDeleteAddress(idx)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          
                          <div className="font-sans text-xs text-gray-600 space-y-0.5">
                            <p className="font-bold text-gray-800 uppercase tracking-wider">Address #{idx + 1}</p>
                            <p className="font-light">{addr.street}</p>
                            <p className="font-light">{addr.city}, {addr.state} - {addr.zipCode}</p>
                            <p className="font-bold text-[#C5A059]">{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add address form */}
                <div className="border-t border-black/5 pt-6 space-y-4">
                  <h4 className="font-serif text-sm uppercase tracking-wider text-gray-900 font-light">
                    Add New Shipping Location
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">Country *</label>
                      <select
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 cursor-pointer"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">Street & Unit *</label>
                      <input
                        type="text"
                        placeholder="e.g., M G Road, Phase 2"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">City *</label>
                      <input
                        type="text"
                        placeholder="Gurugram"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-gray-500">State *</label>
                        <input
                          type="text"
                          placeholder="Haryana"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-gray-500">PIN / Zip Code *</label>
                        <input
                          type="text"
                          placeholder="122002"
                          value={newZipCode}
                          onChange={(e) => setNewZipCode(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddAddress}
                    className="bg-[#121212] hover:bg-[#C5A059] text-white px-5 py-2.5 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Catalog Address</span>
                  </button>
                </div>

              </div>
            )}

            {/* View 4: Saved Favorites */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900 font-light border-b border-black/5 pb-3">
                  Atelier Saved Favorites
                </h3>

                {wishlist.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <Heart className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-widest font-semibold">Favorites log is clean</p>
                    <button onClick={() => setCurrentPage("collections")} className="bg-[#121212] text-white px-6 py-2.5 rounded-sm font-sans text-xs uppercase tracking-widest font-bold">Browse Collections</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.filter(p => wishlist.includes(p.id)).map((product) => (
                      <div key={product.id} className="border border-black/5 p-4 rounded-sm flex gap-4 items-center relative">
                        <button
                          onClick={() => handleToggleWishlist(product.id)}
                          className="absolute top-2 right-2 text-[#C5A059] hover:scale-110 cursor-pointer"
                        >
                          <Heart className="w-4.5 h-4.5 fill-[#C5A059]" />
                        </button>

                        <div className="w-20 h-20 overflow-hidden rounded-sm bg-neutral-100 shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-1 font-sans text-xs">
                          <p className="font-serif font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="font-mono text-[9px] text-[#C5A059] uppercase tracking-widest">{product.category}</p>
                          <p className="font-bold text-gray-800">{formatPrice(product.price)}</p>
                          <button
                            onClick={() => {
                              setCurrentPage("collections");
                              // Scrolling anchor to details can be simulated or handled in parent catalog
                            }}
                            className="text-[#C5A059] font-bold uppercase tracking-widest text-[9px] border-b border-[#C5A059]/30 hover:border-[#C5A059]"
                          >
                            Explore Masterpiece
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 5: Profile Info */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg uppercase tracking-wider text-gray-900 font-light border-b border-black/5 pb-3">
                  Aesthetic Profile Info
                </h3>

                <div className="space-y-4 max-w-md font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Patron Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Email Address (Registered)</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm text-gray-400 cursor-not-allowed font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleUpdateProfile({ name: editName })}
                    className="bg-[#121212] hover:bg-[#C5A059] text-white px-6 py-2.5 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

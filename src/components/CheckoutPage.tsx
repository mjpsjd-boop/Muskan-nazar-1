import React, { useState } from "react";
import { CreditCard, ShoppingBag, MapPin, Truck, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Product } from "../types";

interface CheckoutPageProps {
  cartItems: any[];
  currency: string;
  formatPrice: (price: number) => string;
  onClearCart: () => void;
  setCurrentPage: (page: string) => void;
}

export default function CheckoutPage({
  cartItems,
  currency,
  formatPrice,
  onClearCart,
  setCurrentPage
}: CheckoutPageProps) {
  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    state: "Delhi",
    zipCode: "",
    country: "India",
    name: "",
    email: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("Razorpay (UPI)");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Form check
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  const indianStates = [
    "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Haryana", 
    "Uttar Pradesh", "West Bengal", "Gujarat", "Rajasthan", "Punjab",
    "Kerala", "Telangana", "Andhra Pradesh", "Bihar", "Goa"
  ];

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscountPercent(data.discountPercent);
        setCouponSuccess(`Promotional coupon applied: ${data.discountPercent}% Off!`);
      } else {
        setCouponError("Invalid coupon code. Try 'WELCOME5' or 'ROYALTY10'");
      }
    } catch (err) {
      setCouponError("Network error validating coupon.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate fields
    if (!shipping.name || !shipping.email || !shipping.street || !shipping.city || !shipping.zipCode) {
      setValidationError("Please fill out all required customer and delivery details.");
      return;
    }

    // Validate Indian PIN Code if country is India
    if (shipping.country?.toLowerCase() === "india") {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(shipping.zipCode)) {
        setValidationError("Invalid Indian PIN code. Must be a valid 6-digit code starting with 1-9.");
        return;
      }
    }

    setSubmitting(true);

    // Calculate prices
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = Math.round(subtotal * (discountPercent / 100));
    const totalAmount = subtotal - discount;

    const orderData = {
      customerName: shipping.name,
      customerEmail: shipping.email,
      customerPhone: shipping.phone,
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedFabric: item.selectedFabric,
        selectedSize: item.selectedSize,
        isCustomized: item.isCustomized,
        customMeasurements: item.customMeasurements
      })),
      totalAmount,
      currency: "INR", // DEFAULT INR FOR TAXES
      shippingAddress: {
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zipCode,
        country: shipping.country
      },
      paymentMethod
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const result = await res.json();
        setOrderComplete(result);
        onClearCart();
      } else {
        const errorData = await res.json();
        setValidationError(errorData.error || "Order placement failed on backend.");
      }
    } catch (err) {
      setValidationError("Failed to connect to the atelier servers.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = subtotal - discount;
  const estimatedGst = shipping.country?.toLowerCase() === "india" ? Math.round(finalTotal * (0.18 / (1 + 0.18))) : 0;

  if (orderComplete) {
    return (
      <div className="py-24 bg-[#FAF9F6] text-[#121212] select-none text-center">
        <div className="max-w-md mx-auto bg-white border border-black/5 p-8 sm:p-12 rounded-sm shadow-sm space-y-6">
          <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#C5A059] tracking-widest uppercase font-semibold">Atelier Order Secured</span>
            <h2 className="font-serif text-2xl uppercase tracking-wide">Thank You, {orderComplete.customerName}</h2>
            <p className="font-sans text-xs text-gray-500 font-light">Order ID: <span className="font-mono font-bold text-gray-800">{orderComplete.id}</span></p>
          </div>

          <div className="border-t border-b border-black/5 py-4 space-y-1.5 font-sans text-xs">
            <div className="flex justify-between font-light">
              <span className="text-gray-500">Total Invoice Amount:</span>
              <span className="font-semibold">{formatPrice(orderComplete.totalAmount)}</span>
            </div>
            {orderComplete.gstAmount > 0 && (
              <div className="flex justify-between font-light text-gray-500">
                <span>Integrated GST Included (18%):</span>
                <span>{formatPrice(orderComplete.gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-light">
              <span className="text-gray-500">DHL Delivery Frame:</span>
              <span className="font-semibold text-green-600">Insured Priority Transit</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`/api/orders/${orderComplete.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-[#121212] hover:bg-[#C5A059] text-white py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
            >
              Download GST-Ready Invoice
            </a>
            
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full text-center border border-black/10 hover:border-[#C5A059] text-gray-700 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
            >
              Return To Atelier Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-24 bg-[#FAF9F6] text-[#121212] text-center select-none">
        <div className="max-w-md mx-auto space-y-6">
          <ShoppingBag className="w-12 h-12 text-[#C5A059] mx-auto opacity-50" />
          <h2 className="font-serif text-2xl uppercase tracking-wide">Checkout is empty</h2>
          <p className="font-sans text-xs text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
            You currently have no masterpieces in your atelier cart. Please browse our high couture Bridal or Luxury Formal collections.
          </p>
          <button
            onClick={() => setCurrentPage("collections")}
            className="bg-[#121212] hover:bg-[#C5A059] text-white px-8 py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
          >
            Explore Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF9F6] text-[#121212] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            SECURE ATELIER ORDERING
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-black font-light mb-4">
            Haute Couture Checkout
          </h1>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Checkout Form */}
          <div className="lg:col-span-7 bg-white border border-black/5 p-6 sm:p-8 rounded-sm">
            <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs font-sans">
              
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-light">{validationError}</span>
                </div>
              )}

              {/* Step 1: Customer Contact */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900 border-b border-black/5 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059] text-[10px]">1</span>
                  <span>Contact Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">FullName *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={shipping.email}
                        onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">Phone Hotline *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g., +91 9876543210"
                        value={shipping.phone}
                        onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900 border-b border-black/5 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059] text-[10px]">2</span>
                  <span>Delivery Address & Transit</span>
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Country *</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 cursor-pointer"
                    >
                      <option value="India">India (18% integrated GST invoices)</option>
                      <option value="United States">United States (Express Shipping)</option>
                      <option value="United Kingdom">United Kingdom (Insured Transit)</option>
                      <option value="United Arab Emirates">United Arab Emirates (Insured Transit)</option>
                      <option value="Saudi Arabia">Saudi Arabia (Insured Transit)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Street & Apartment *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Suite 104, Golf Course Road"
                      value={shipping.street}
                      onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                      className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Gurugram"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">State / Territory *</label>
                      {shipping.country?.toLowerCase() === "india" ? (
                        <select
                          value={shipping.state}
                          onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                          className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 cursor-pointer"
                        >
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="e.g. California"
                          value={shipping.state}
                          onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                          className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-gray-500">
                        {shipping.country?.toLowerCase() === "india" ? "PIN Code *" : "Zip / Postal Code *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={shipping.country?.toLowerCase() === "india" ? "122003" : "10021"}
                        value={shipping.zipCode}
                        onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Configuration */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900 border-b border-black/5 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059] text-[10px]">3</span>
                  <span>Select Payment Gateway</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Razorpay (UPI)")}
                    className={`p-4 border text-left rounded-sm transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === "Razorpay (UPI)"
                        ? "border-[#C5A059] bg-[#FAF9F6]"
                        : "border-black/5 bg-transparent"
                    }`}
                  >
                    <div>
                      <p className="font-bold">Indian Razorpay</p>
                      <p className="text-[10px] text-gray-500 font-light mt-0.5">UPI, PhonePe, Netbanking, Cards</p>
                    </div>
                    <CreditCard className="w-5 h-5 text-[#C5A059]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Stripe Card Integration")}
                    className={`p-4 border text-left rounded-sm transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === "Stripe Card Integration"
                        ? "border-[#C5A059] bg-[#FAF9F6]"
                        : "border-black/5 bg-transparent"
                    }`}
                  >
                    <div>
                      <p className="font-bold">International Cards</p>
                      <p className="text-[10px] text-gray-500 font-light mt-0.5">Stripe, PayPal, Apple Pay, Visa</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#121212] hover:bg-[#C5A059] text-white py-4 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:bg-gray-400"
              >
                <Truck className="w-4 h-4 animate-bounce" />
                <span>{submitting ? "SECURING DATABASE TRANSACTION..." : `CONFIRM WORKPLACE ORDER (${formatPrice(finalTotal)})`}</span>
              </button>

            </form>
          </div>

          {/* Cart Sidebar Breakdown */}
          <div className="lg:col-span-5 bg-white border border-black/5 p-6 sm:p-8 rounded-sm space-y-6">
            <h3 className="font-serif text-sm uppercase tracking-widest font-semibold text-gray-900 border-b border-black/5 pb-2">
              Atelier Ledger
            </h3>

            {/* List */}
            <div className="divide-y divide-black/5 max-h-72 overflow-y-auto pr-2 space-y-3">
              {cartItems.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-xs font-bold text-gray-900">{item.productName}</h4>
                    <p className="font-sans text-[10px] text-gray-400 leading-none">
                      Qty: {item.quantity} | Size: {item.selectedSize} | {item.selectedColor}
                    </p>
                    {item.isCustomized && (
                      <p className="text-[9px] text-[#C5A059] font-sans font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        Bespoke Fitting Configured
                      </p>
                    )}
                  </div>
                  <span className="font-sans text-xs font-bold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code entry */}
            <div className="border-t border-black/5 pt-4 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 block">Promotional Voucher</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME5 or ROYALTY10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-[#FAF9F6] border border-black/5 px-3 py-2 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 text-xs flex-1 uppercase"
                />
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon}
                  className="bg-[#121212] hover:bg-[#C5A059] text-white px-4 py-2 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-[10px] font-sans text-red-600 font-medium">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] font-sans text-green-600 font-medium">{couponSuccess}</p>}
            </div>

            {/* Subtotals ledger */}
            <div className="border-t border-black/5 pt-4 space-y-2 font-sans text-xs">
              <div className="flex justify-between font-light">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-light text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              {estimatedGst > 0 && (
                <div className="flex justify-between font-light text-gray-500">
                  <span>Integrated GST (18% included):</span>
                  <span>{formatPrice(estimatedGst)}</span>
                </div>
              )}
              <div className="flex justify-between font-light">
                <span className="text-gray-500">DHL Premium Worldwide Shipping:</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black/5 pt-3 text-gray-900 font-serif">
                <span>Grand Total:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-4 border border-black/5 rounded-sm flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
              <p className="font-sans text-[10px] text-gray-500 leading-relaxed font-light">
                <strong>Fitting Insurance Policy:</strong> Every bridal and luxury formal purchase is covered under Muskan Nazar’s fitting guarantee. Complimentary alterations and DHL-secured returns are fully protected.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

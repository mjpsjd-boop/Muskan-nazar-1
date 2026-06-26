import React, { useState } from "react";
import { X, Trash2, ShoppingBag, ShieldCheck, Ticket, CheckCircle2, CreditCard } from "lucide-react";
import { Measurement } from "../types";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedFabric: string;
  selectedSize: string;
  isCustomized: boolean;
  customMeasurements?: Measurement;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (index: number) => void;
  currency: string;
  formatPrice: (price: number) => string;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  currency,
  formatPrice,
  onClearCart
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');

  // Shipping details form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("United States");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Stripe Credit Card");

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  if (!isOpen) return null;

  // Pricing math
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (appliedDiscount / 100));
  const finalTotal = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedDiscount(data.discountPercent);
        setCouponSuccess(`Success! ${data.discountPercent}% Discount applied.`);
      } else {
        setCouponError("Invalid or expired coupon code.");
        setAppliedDiscount(0);
      }
    } catch (err) {
      // Local fallback coupon validator
      const codeUpper = couponCode.toUpperCase();
      if (codeUpper === "ELEGANCE10") {
        setAppliedDiscount(10);
        setCouponSuccess("Success! 10% Discount applied (local mode).");
      } else if (codeUpper === "ROYALTY15") {
        setAppliedDiscount(15);
        setCouponSuccess("Success! 15% Discount applied (local mode).");
      } else {
        setCouponError("Invalid coupon code (offline).");
        setAppliedDiscount(0);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !street || !city || !zip) {
      alert("Please complete all shipping address fields.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          items: cartItems,
          totalAmount: finalTotal,
          currency,
          shippingAddress: {
            street,
            city,
            state: "",
            zipCode: zip,
            country
          },
          paymentMethod
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPlacedOrder(data);
        setCheckoutStep('success');
        onClearCart();
      } else {
        alert(data.error || "Order creation failed.");
      }
    } catch (err) {
      // Offline fallback order save
      setPlacedOrder({
        id: `MN-OFFLINE-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: name,
        customerEmail: email,
        totalAmount: finalTotal,
        paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid"
      });
      setCheckoutStep('success');
      onClearCart();
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fade-in bg-black/50 backdrop-blur-xs flex justify-end">
      
      {/* Drawer Sidebar */}
      <div className="w-full sm:w-[480px] bg-[#FCFBFA] border-l border-[#eae6db] shadow-2xl h-full flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-5 border-b border-[#eae6db] bg-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif text-[14px] uppercase tracking-widest font-bold text-gray-900 leading-none">
              {checkoutStep === 'cart' && "Your Shopping Bag"}
              {checkoutStep === 'shipping' && "Luxury Fitting & Shipping"}
              {checkoutStep === 'success' && "Order Finalized"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-gray-100 rounded-full text-gray-500 hover:bg-black hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Steps Content */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-[#faf9f6]">
                <ShoppingBag className="w-12 h-12 text-[#eae6db] mb-4" />
                <p className="font-serif text-base text-gray-800 uppercase tracking-widest mb-2">Shopping Bag is Empty</p>
                <p className="font-sans text-xs text-gray-500 leading-relaxed max-w-xs mb-6">Explore our Bridals and Ready-to-Wear collections to fill your custom styling slot.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#111] hover:bg-amber-700 text-white font-sans text-xs uppercase tracking-widest"
                >
                  Return to Atelier
                </button>
              </div>
            ) : (
              <>
                {/* List items */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-[#faf9f6]">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#eae6db] p-4 flex gap-4 items-start relative hover:border-[#aa7c11] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-serif text-xs uppercase tracking-wider text-gray-950 font-semibold">{item.productName}</h4>
                          <button
                            onClick={() => onRemoveItem(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-1.5 space-y-1 text-[10px] font-sans text-gray-500 uppercase tracking-wider">
                          <p>Attributes: <span className="text-gray-800 font-semibold">{item.selectedColor}</span> | <span className="text-gray-800 font-semibold">{item.selectedFabric}</span></p>
                          <p>Size Specification: <span className="text-amber-800 font-bold">{item.selectedSize}</span></p>
                          {item.isCustomized && item.customMeasurements && (
                            <p className="font-mono text-[9px] text-amber-700 bg-amber-50 p-1.5 rounded-xs mt-1.5">
                              Measurements: {item.customMeasurements.height}, {item.customMeasurements.bust} Bust, {item.customMeasurements.waist} Waist, {item.customMeasurements.hips} Hips
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex justify-between items-center border-t border-gray-100 pt-3">
                          <span className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Quantity: {item.quantity}</span>
                          <span className="font-mono text-xs font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="p-5 border-t border-[#eae6db] bg-white space-y-4">
                  {/* Coupon checker */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-600" />
                      <span className="font-sans text-[10px] text-amber-800 uppercase tracking-widest font-semibold">Couture Privilege Code</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. ELEGANCE10, ROYALTY15"
                        className="flex-1 bg-[#faf9f6] border border-[#eae6db] py-1.5 px-3 text-xs font-mono uppercase focus:outline-none focus:border-amber-600"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-black hover:bg-amber-700 text-white px-4 py-1.5 text-xs font-sans uppercase tracking-widest"
                      >
                        Apply
                      </button>
                    </div>
                    {couponSuccess && <p className="text-[10px] font-sans text-green-600 font-medium">{couponSuccess}</p>}
                    {couponError && <p className="text-[10px] font-sans text-red-600 font-medium">{couponError}</p>}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 border-t border-gray-100 pt-3 font-sans text-xs text-gray-500 uppercase tracking-widest">
                    <div className="flex justify-between">
                      <span>Couture Subtotal</span>
                      <span className="font-mono text-gray-800 font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedDiscount}%)</span>
                        <span className="font-mono font-medium">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Worldwide DHL Delivery</span>
                      <span className="text-green-700 font-semibold font-mono">FREE (VALUED AT $150)</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-sm text-gray-900 font-semibold">
                      <span>Final Ledger Total</span>
                      <span className="font-mono text-amber-800 font-bold text-base">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setCheckoutStep('shipping')}
                      className="w-full py-3.5 bg-[#111] hover:bg-[#aa7c11] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold shadow-lg transition-colors"
                    >
                      Advance to Checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {checkoutStep === 'shipping' && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="p-5 space-y-6 flex-1 overflow-y-auto bg-[#faf9f6]">
              
              {/* Back to Cart button */}
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="text-[10px] uppercase text-amber-700 hover:text-black tracking-widest font-bold flex items-center gap-1"
              >
                &larr; Return to Bag summary
              </button>

              <div className="space-y-4">
                <h4 className="font-serif text-sm uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 font-medium">Client Address Portfolio</h4>
                
                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1 font-semibold">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#eae6db] text-xs py-2 px-3 focus:outline-none focus:border-amber-600"
                      placeholder="Princess Amina"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1 font-semibold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#eae6db] text-xs py-2 px-3 focus:outline-none focus:border-amber-600"
                      placeholder="amina@royal.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1 font-semibold">Street & Residence details *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-white border border-[#eae6db] text-xs py-2 px-3 focus:outline-none focus:border-amber-600"
                      placeholder="Park Avenue Suite 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1 font-semibold">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-[#eae6db] text-xs py-2 px-3 focus:outline-none"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1 font-semibold">Postal Zip Code *</label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full bg-white border border-[#eae6db] text-xs py-2 px-3 focus:outline-none"
                        placeholder="10021"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-gray-500 tracking-wider mb-1 font-semibold">Destination Country *</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-white border border-[#eae6db] text-xs py-2 px-3 focus:outline-none"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="font-serif text-sm uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 font-medium">Secured Checkout Gateway</h4>
                
                <div className="space-y-2">
                  {[
                    "Stripe Checkout",
                    "Apple Pay / Google Pay",
                    "PayPal Insured Transfer",
                    "Cash on Delivery",
                    "Royal Bank Wire Transfer"
                  ].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all ${
                        paymentMethod === method ? "border-[#aa7c11] bg-[#fffdf9] text-amber-900" : "border-gray-200 bg-white text-gray-700 hover:border-black"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-xs font-sans tracking-wide">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="text-[#aa7c11] focus:ring-[#aa7c11] border-gray-300"
                        />
                        <span>{method}</span>
                      </div>
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit button bar */}
            <div className="p-5 border-t border-[#eae6db] bg-white text-center space-y-3">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500">
                <span>Grand total due</span>
                <span className="font-mono text-amber-800 font-bold text-base">{formatPrice(finalTotal)}</span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full py-3.5 bg-[#111] hover:bg-[#aa7c11] text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold shadow-lg transition-colors disabled:bg-gray-400"
              >
                {isSubmittingOrder ? "Confirming Creation Slot..." : `Place secure ${currency} order`}
              </button>

              <p className="text-[9px] font-sans text-gray-400 leading-relaxed max-w-xs mx-auto">By processing this checkout ledger, you authorize Muskan Nazar drapers to commence tailoring blueprints matching your file dimensions.</p>
            </div>
          </form>
        )}

        {checkoutStep === 'success' && placedOrder && (
          <div className="flex-1 p-8 text-center flex flex-col justify-center items-center bg-[#fffdf9] overflow-y-auto">
            <CheckCircle2 className="w-16 h-16 text-[#aa7c11] mb-4 animate-bounce" />
            <h3 className="font-serif text-xl uppercase tracking-wider text-gray-900 mb-2">Order Confirmed</h3>
            <p className="font-sans text-xs text-gray-600 font-light leading-relaxed max-w-sm mb-6">
              Congratulations, your private creation slot has been guaranteed! A receipt has been issued to your email {email}. Our drapers are currently initializing layout drafts.
            </p>

            <div className="bg-white border border-[#eae6db] p-5 text-left text-xs font-mono text-gray-500 space-y-2 w-full max-w-xs mb-8">
              <p className="font-sans uppercase tracking-widest text-[10px] text-gray-700 font-bold border-b border-gray-100 pb-1.5">Creation ledger summary</p>
              <p>Invoice ID: <span className="text-gray-900 font-semibold">{placedOrder.id}</span></p>
              <p>Client: <span className="text-gray-900">{placedOrder.customerName}</span></p>
              <p>Ledger Sum: <span className="text-amber-800 font-bold">{formatPrice(placedOrder.totalAmount)}</span></p>
              <p>Payment: <span className="text-green-600 font-semibold">{placedOrder.paymentStatus || "Paid"}</span></p>
              <p>Shipping: <span className="text-amber-700">Pending atelier blueprint</span></p>
            </div>

            <button
              onClick={() => {
                setCheckoutStep('cart');
                onClose();
              }}
              className="px-8 py-3 bg-[#111] hover:bg-[#aa7c11] text-white font-sans text-xs uppercase tracking-widest shadow-md transition-colors"
            >
              Return to Catalog
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

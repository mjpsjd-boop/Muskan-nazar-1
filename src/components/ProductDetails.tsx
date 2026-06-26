import React, { useState, useEffect } from "react";
import { X, Heart, Star, Sparkles, Check, Truck, ShieldCheck, Ruler, ChevronDown, Award, AlertCircle } from "lucide-react";
import { Product, Measurement, Review } from "../types";

interface ProductDetailsProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedColor: string;
    selectedFabric: string;
    selectedSize: string;
    isCustomized: boolean;
    customMeasurements?: Measurement;
  }) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  currency: string;
  formatPrice: (price: number) => string;
}

export default function ProductDetails({
  product,
  onClose,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  currency,
  formatPrice
}: ProductDetailsProps) {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Ivory");
  const [selectedFabric, setSelectedFabric] = useState(product.fabrics[0] || "Raw Silk");
  const [selectedSize, setSelectedSize] = useState("M");

  // Custom Sizing Measurement variables
  const [isCustomSizing, setIsCustomSizing] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement>({
    height: "5'5\"",
    bust: "34\"",
    waist: "28\"",
    hips: "38\"",
    shoulderWidth: "15\"",
    sleeveLength: "21\"",
    dressLength: "55\""
  });

  const [activeTab, setActiveTab] = useState<'fabric' | 'embroidery' | 'care' | 'reviews'>('fabric');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Reviews integration
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Review Form States
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [formPhoto, setFormPhoto] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formComment) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: formName,
          customerEmail: formEmail,
          rating: formRating,
          comment: formComment,
          photoUrl: formPhoto || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(
          data.verified
            ? "Your review was successfully submitted and verified! Thank you for sharing."
            : "Review submitted successfully! Pending verification and approval."
        );
        setFormComment("");
        setFormPhoto("");
        fetchReviews();
        setTimeout(() => {
          setShowReviewForm(false);
          setSubmitSuccess("");
        }, 3000);
      } else {
        setSubmitError(data.error || "Failed to submit review.");
      }
    } catch (err) {
      setSubmitError("Network error. Unable to connect to backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const productReviews = reviews.filter((r) => r.productId === product.id && r.approved !== false);

  // Bundle offer (Frequently Bought Together)
  const [includeBundle, setIncludeBundle] = useState(false);
  const bundleItem = {
    name: "Hand-scalloped Shimmer Dupatta",
    price: 350
  };

  const handleSizeChange = (sz: string) => {
    setSelectedSize(sz);
    if (sz === "Custom") {
      setIsCustomSizing(true);
    } else {
      setIsCustomSizing(false);
    }
  };

  const handleAddToCartSubmit = () => {
    const finalPrice = includeBundle ? product.price + bundleItem.price : product.price;
    onAddToCart({
      productId: product.id,
      productName: includeBundle ? `${product.name} + Bundle Dupatta` : product.name,
      price: finalPrice,
      quantity,
      selectedColor,
      selectedFabric,
      selectedSize,
      isCustomized: selectedSize === "Custom",
      customMeasurements: selectedSize === "Custom" ? measurements : undefined
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1500);
  };

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 lg:p-10 select-none animate-fade-in">
      <div className="bg-[#FCFBFA] w-full max-w-6xl border border-[#eae6db] shadow-2xl relative flex flex-col md:flex-row items-stretch overflow-hidden max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-white/90 p-2 border border-gray-100 rounded-full hover:bg-black hover:text-white transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery Column */}
        <div className="w-full md:w-1/2 p-6 lg:p-10 flex flex-col justify-between border-r border-[#eae6db] overflow-y-auto">
          <div>
            {/* Primary Main Image Zoom */}
            <div className="aspect-[4/5] bg-[#faf9f6] border border-[#f0ece3] overflow-hidden relative mb-4">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.04]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnail switcher */}
            <div className="flex gap-3">
              {(product.gallery && product.gallery.length ? product.gallery : [product.image]).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 aspect-[4/5] bg-gray-50 border overflow-hidden transition-all ${
                    activeImage === img ? "border-[#aa7c11] ring-1 ring-[#aa7c11]" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Premium Badges */}
          <div className="grid grid-cols-2 gap-4 mt-8 border-t border-[#f0ece3] pt-6 text-[11px] font-sans tracking-wide text-gray-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4.5 h-4.5 text-amber-600" />
              <span>Worldwide DHL Courier</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
              <span>100% Insured Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-amber-600" />
              <span>Artisan-Made Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4.5 h-4.5 text-amber-600" />
              <span>Bespoke Fit Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Right: Info Column */}
        <div className="w-full md:w-1/2 p-6 lg:p-10 overflow-y-auto flex flex-col justify-between bg-white max-h-[90vh]">
          <div>
            <span className="font-mono text-[10px] text-amber-700 tracking-[0.3em] uppercase block mb-2 font-semibold">
              {product.category}
            </span>

            <h2 className="font-serif text-2xl lg:text-3xl font-light uppercase tracking-wide text-gray-900 mb-3">
              {product.name}
            </h2>

            {/* Star ratings */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-xs font-sans text-gray-400">({product.reviewsCount} verified couture reviews)</span>
            </div>

            {/* Price section */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-light text-[#1a1a1a]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-base text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="font-sans text-xs sm:text-sm text-gray-600 font-light leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Options selection */}
            <div className="space-y-6 border-t border-[#f0ece3] pt-6 mb-6">
              
              {/* Color */}
              <div>
                <span className="font-sans text-[11px] uppercase tracking-widest text-amber-700 font-semibold block mb-2">Color Hue</span>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-all ${
                        selectedColor === c ? "bg-[#111] text-white border-black font-semibold" : "bg-white text-gray-600 border-gray-200 hover:border-black"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              <div>
                <span className="font-sans text-[11px] uppercase tracking-widest text-amber-700 font-semibold block mb-2">Selected Fabric</span>
                <div className="flex gap-2">
                  {product.fabrics.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFabric(f)}
                      className={`px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-all ${
                        selectedFabric === f ? "bg-[#111] text-white border-black font-semibold" : "bg-white text-gray-600 border-gray-200 hover:border-black"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-amber-700 font-semibold">Couture Sizing</span>
                  <button className="flex items-center gap-1 text-[10px] uppercase text-gray-400 hover:text-black tracking-wider">
                    <Ruler className="w-3 h-3" />
                    <span>View Sizing Blueprint</span>
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSizeChange(sz)}
                      className={`w-10 h-10 text-xs flex justify-center items-center font-mono border transition-all ${
                        selectedSize === sz ? "bg-amber-700 text-white border-amber-700 font-bold" : "bg-white text-gray-600 border-gray-200 hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Measurements Inputs */}
              {isCustomSizing && (
                <div className="bg-[#faf9f6] border border-[#d4af37]/40 p-4 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                    <span className="font-serif text-xs uppercase tracking-wider text-gray-800 font-medium">Bespoke Fitting Form</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans leading-relaxed">Enter your exact measurements. Our drapers will cross-reference these for flawless posture fit.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.keys(measurements).map((key) => (
                      <div key={key}>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-mono">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type="text"
                          value={measurements[key as keyof Measurement]}
                          onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                          className="w-full bg-white border border-[#eae6db] text-xs font-mono py-1 px-2 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bundles (Frequently bought together) */}
              <div className="border-t border-[#f0ece3] pt-6">
                <span className="font-sans text-[11px] uppercase tracking-widest text-amber-700 font-semibold block mb-3">Frequently Bought Together</span>
                <div className="border border-amber-200/40 bg-[#fffdf9] p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={includeBundle}
                      onChange={(e) => setIncludeBundle(e.target.checked)}
                      className="rounded border-[#eae6db] text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-sans font-semibold text-gray-800">{bundleItem.name}</p>
                      <p className="text-[10px] text-gray-500 font-sans">Crafted matching your chosen base velvet/silk fabric</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-amber-800 font-bold">+{formatPrice(bundleItem.price)}</span>
                </div>
              </div>

              {/* Tabs detail */}
              <div className="border-t border-[#f0ece3] pt-6">
                <div className="flex gap-4 border-b border-gray-100 pb-2 mb-3 text-[11px] uppercase tracking-widest font-sans font-medium flex-wrap">
                  <button onClick={() => setActiveTab('fabric')} className={`pb-1 cursor-pointer transition-all ${activeTab === 'fabric' ? "border-b border-[#aa7c11] text-[#aa7c11]" : "text-gray-400 hover:text-black"}`}>Fabric Details</button>
                  <button onClick={() => setActiveTab('embroidery')} className={`pb-1 cursor-pointer transition-all ${activeTab === 'embroidery' ? "border-b border-[#aa7c11] text-[#aa7c11]" : "text-gray-400 hover:text-black"}`}>Embroidery Work</button>
                  <button onClick={() => setActiveTab('care')} className={`pb-1 cursor-pointer transition-all ${activeTab === 'care' ? "border-b border-[#aa7c11] text-[#aa7c11]" : "text-gray-400 hover:text-black"}`}>Care Manual</button>
                  <button onClick={() => setActiveTab('reviews')} className={`pb-1 cursor-pointer transition-all ${activeTab === 'reviews' ? "border-b border-[#aa7c11] text-[#aa7c11]" : "text-gray-400 hover:text-black"}`}>Client Reviews ({productReviews.length})</button>
                </div>
                <div className="text-xs font-sans text-gray-500 font-light leading-relaxed tracking-wide min-h-16">
                  {activeTab === 'fabric' && product.fabricDetails}
                  {activeTab === 'embroidery' && product.embroideryDetails}
                  {activeTab === 'care' && product.careInstructions}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6 pt-2">
                      <div className="flex justify-between items-center pb-2 border-b border-black/5">
                        <span className="font-serif text-xs uppercase tracking-wider text-black font-semibold">Verified Feedback</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm(!showReviewForm);
                            setSubmitSuccess("");
                            setSubmitError("");
                          }}
                          className="text-[9px] uppercase font-sans tracking-widest bg-[#121212] hover:bg-[#C5A059] text-white px-3 py-1.5 transition-colors cursor-pointer"
                        >
                          {showReviewForm ? "Cancel" : "Write Review"}
                        </button>
                      </div>

                      {showReviewForm ? (
                        <form onSubmit={handleReviewSubmit} className="bg-[#FAF9F6] border border-[#eae6db]/60 p-4 space-y-4 rounded-none animate-fade-in text-left">
                          <span className="font-mono text-[9px] text-[#C5A059] tracking-widest uppercase block mb-1 font-semibold">Submit Your Dior Diary Entry</span>
                          
                          {submitError && (
                            <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 text-[10px] flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>{submitError}</span>
                            </div>
                          )}

                          {submitSuccess && (
                            <div className="p-2.5 bg-green-50 border border-green-100 text-green-800 text-[10px] flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                              <span>{submitSuccess}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">FullName *</label>
                              <input
                                type="text"
                                required
                                placeholder="FullName"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="w-full bg-white border border-black/10 px-2.5 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">Email *</label>
                              <input
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                className="w-full bg-white border border-black/10 px-2.5 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-500 font-medium block">Rating: {formRating} Stars</label>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setFormRating(star)}
                                  className="p-0.5 cursor-pointer transition-transform hover:scale-125"
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= formRating
                                        ? "fill-[#C5A059] text-[#C5A059]"
                                        : "text-gray-200"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">Written Feedback *</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Describe the silhouette drape, luxurious feel, and your fitting experience..."
                              value={formComment}
                              onChange={(e) => setFormComment(e.target.value)}
                              className="w-full bg-white border border-black/10 px-2.5 py-2 text-xs focus:outline-none focus:border-[#C5A059] resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-gray-500 font-medium">Wear Photo URL (Optional)</label>
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/... or cloud image link"
                              value={formPhoto}
                              onChange={(e) => setFormPhoto(e.target.value)}
                              className="w-full bg-white border border-black/10 px-2.5 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#121212] hover:bg-[#C5A059] text-white py-2 rounded-none text-[10px] uppercase tracking-widest font-semibold transition-all disabled:bg-gray-400 cursor-pointer"
                          >
                            {submitting ? "SUBMITTING REVIEW..." : "SUBMIT DIARY ENTRY"}
                          </button>
                        </form>
                      ) : null}

                      {reviewsLoading ? (
                        <div className="text-center py-4 font-mono text-[9px] text-[#C5A059] uppercase tracking-widest animate-pulse">Loading Gown Reviews...</div>
                      ) : productReviews.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-gray-200 bg-[#FAF9F6]">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-sans">No reviews for this masterpiece yet.</p>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(true)}
                            className="text-[9px] uppercase text-[#C5A059] underline tracking-widest font-semibold mt-1 cursor-pointer"
                          >
                            Be the first to review
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-72 overflow-y-auto pr-1 text-left">
                          {productReviews.map((rev) => (
                            <div key={rev.id} className="border-b border-black/5 pb-4 space-y-1.5 last:border-none">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-[#C5A059] text-[#C5A059]" : "text-gray-200"}`} />
                                    ))}
                                  </div>
                                  <h5 className="text-[10px] font-semibold text-black tracking-wide flex items-center gap-1.5 mt-1">
                                    <span>{rev.customerName}</span>
                                    {rev.verified && (
                                      <span className="inline-flex items-center gap-0.5 text-[#C5A059] text-[8px] tracking-wider uppercase bg-[#FAF9F6] px-1 py-0.2 border border-[#C5A059]/20 font-sans font-semibold">
                                        <ShieldCheck className="w-2.5 h-2.5" />
                                        Verified Buyer
                                      </span>
                                    )}
                                  </h5>
                                </div>
                                <span className="text-[9px] text-gray-400 font-mono">{rev.date}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 font-light leading-relaxed">"{rev.comment}"</p>
                              {rev.photo && (
                                <div className="w-12 h-12 overflow-hidden border border-black/5 mt-1">
                                  <img src={rev.photo} alt="Attached client photo" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Checkout triggers */}
          <div className="border-t border-[#f0ece3] pt-6 flex items-center gap-4">
            <div className="flex items-center border border-gray-300">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-xs font-mono">-</button>
              <span className="px-4 text-xs font-mono">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-xs font-mono">+</button>
            </div>

            <button
              onClick={handleAddToCartSubmit}
              disabled={isAdded}
              className={`flex-1 py-3.5 font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-md ${
                isAdded ? "bg-amber-600 text-white" : "bg-[#111] hover:bg-amber-700 text-white"
              }`}
            >
              {isAdded ? "Added to Couture Cart!" : "Request Creation Slot"}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-3 border border-gray-300 hover:border-black transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

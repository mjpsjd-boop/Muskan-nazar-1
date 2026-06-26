import React, { useState, useEffect } from "react";
import { Star, CheckCircle, ShieldCheck, Upload, AlertCircle, Sparkles, Filter } from "lucide-react";
import { Product, Review } from "../types";

interface ReviewsPageProps {
  products: Product[];
  currency: string;
  formatPrice: (price: number) => string;
}

export default function ReviewsPage({ products, currency, formatPrice }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Submit Form States
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        // Sort newest first
        setReviews(data);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formName || !formEmail || !formComment) {
      setMessage("Please complete all required fields.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          customerName: formName,
          customerEmail: formEmail,
          rating: formRating,
          comment: formComment,
          photoUrl: formPhoto || undefined
        })
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(
          result.verified
            ? "Thank you! Your verified purchase review has been approved and saved permanently."
            : "Review submitted. If your email is recognized in our database as a buyer, a verified purchase badge is attached automatically."
        );
        // Reset
        setFormComment("");
        setFormPhoto("");
        fetchReviews();
      } else {
        setMessage(result.error || "Review submission failed.");
        setIsError(true);
      }
    } catch (err) {
      setMessage("Network error. Unable to post your feedback.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const approvedReviews = reviews.filter((r) => r.approved !== false);
  const filteredReviews = filterRating > 0 
    ? approvedReviews.filter((r) => r.rating === filterRating) 
    : approvedReviews;

  const averageRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1) 
    : "5.0";

  return (
    <div className="py-12 bg-[#FAF9F6] text-[#121212] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs text-[#C5A059] tracking-[0.4em] uppercase block mb-3 font-semibold">
            VERIFIED CONFESSIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-wide uppercase text-black font-light mb-4">
            International Client Diaries
          </h1>
          <div className="w-16 h-[1px] bg-[#C5A059] mx-auto mb-6"></div>
          <p className="font-sans text-xs sm:text-sm text-gray-500 font-light leading-relaxed tracking-wide">
            Read transparent, permanently saved reviews from our clients worldwide. Submitting a review requires matching purchase records for verified status badges.
          </p>
        </div>

        {/* Rating Breakdown Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border border-black/5 p-8 rounded-sm">
          
          {/* Average Rating Block */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 border-r border-black/5">
            <span className="font-serif text-6xl text-gray-900 font-light">{averageRating}</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(Number(averageRating))
                      ? "fill-[#C5A059] text-[#C5A059]"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="font-sans text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Based on {approvedReviews.length} Verified Submissions
            </p>
          </div>

          {/* Filters and Search */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-4">
            <h4 className="font-serif text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C5A059]" />
              <span>Filter Customer Testimonials</span>
            </h4>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterRating(0)}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest border rounded-full transition-all ${
                  filterRating === 0
                    ? "bg-[#121212] text-white border-[#121212]"
                    : "bg-transparent border-black/10 hover:border-[#C5A059] text-gray-600"
                }`}
              >
                All Stars ({approvedReviews.length})
              </button>
              {[5, 4, 3].map((star) => {
                const count = approvedReviews.filter((r) => r.rating === star).length;
                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(star)}
                    className={`px-4 py-2 font-sans text-xs uppercase tracking-widest border rounded-full transition-all flex items-center gap-1.5 ${
                      filterRating === star
                        ? "bg-[#121212] text-white border-[#121212]"
                        : "bg-transparent border-black/10 hover:border-[#C5A059] text-gray-600"
                    }`}
                  >
                    <span>{star} Stars</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-12 text-xs font-mono tracking-widest text-[#C5A059] animate-pulse">
                LOADING ATELIER DIARIES...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-16 bg-white border border-black/5 rounded-sm">
                <p className="font-sans text-xs text-gray-400 uppercase tracking-widest">
                  No submissions matching this filter.
                </p>
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const associatedProduct = products.find((p) => p.id === rev.productId);
                return (
                  <div
                    key={rev.id}
                    className="bg-white border border-black/5 p-6 sm:p-8 rounded-sm space-y-4 hover:border-[#C5A059] transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                          ))}
                        </div>
                        <h4 className="font-serif text-xs uppercase tracking-wider text-gray-900 font-bold flex items-center gap-1.5 pt-1">
                          <span>{rev.customerName}</span>
                          {rev.verified && (
                            <span className="flex items-center gap-0.5 text-[#C5A059] text-[9px] font-sans font-semibold tracking-wider uppercase bg-[#FAF9F6] px-1.5 py-0.5 rounded-sm border border-[#C5A059]/20">
                              <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
                              Verified Buyer
                            </span>
                          )}
                        </h4>
                      </div>
                      <span className="font-sans text-[10px] text-gray-400">{rev.date}</span>
                    </div>

                    {associatedProduct && (
                      <p className="font-mono text-[9px] text-[#C5A059] uppercase tracking-widest font-semibold">
                        Gown Reference: {associatedProduct.name} (₹{associatedProduct.price.toLocaleString()})
                      </p>
                    )}

                    <p className="font-sans text-xs sm:text-sm text-gray-700 font-light leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {rev.photo && (
                      <div className="w-16 h-16 rounded-sm overflow-hidden border border-black/5 mt-2">
                        <img
                          src={rev.photo}
                          alt="Review attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Submit form panel */}
          <div className="bg-white border border-black/5 p-6 sm:p-8 rounded-sm space-y-6">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-[#C5A059] tracking-widest uppercase font-semibold block">
                DIARY SUBMISSION
              </span>
              <h3 className="font-serif text-lg uppercase tracking-wide text-gray-900 font-light pb-2 border-b border-black/5">
                Leave Your Confession
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-xs">
              {message && (
                <div className={`p-3 rounded-sm flex items-start gap-2 border ${
                  isError 
                    ? "bg-red-50 border-red-200 text-red-800" 
                    : "bg-green-50 border-green-200 text-green-800"
                }`}>
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isError ? "text-red-600" : "text-green-600"}`} />
                  <span className="font-light">{message}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500">Select Masterpiece *</label>
                <select
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 cursor-pointer"
                >
                  <option value="">-- Choose Gown worn --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">FullName *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Buyer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                  Atelier Rating: {formRating} Stars
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
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
                <label className="text-[10px] uppercase tracking-wider text-gray-500">Written Feedback *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the fabric weight, drape, fitting consultation, and your event experience..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-gray-500">Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Link to your wearing photo..."
                  value={formPhoto}
                  onChange={(e) => setFormPhoto(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#C5A059] text-gray-800"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#121212] hover:bg-[#C5A059] text-white py-3 rounded-sm font-sans text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:bg-gray-400"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{submitting ? "PERSISTING IN DATABASE..." : "SUBMIT DIARY INTRY"}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

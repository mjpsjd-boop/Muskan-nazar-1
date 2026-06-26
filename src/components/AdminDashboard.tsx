import React, { useState, useEffect } from "react";
import { Sliders, Sparkles, Plus, Trash2, ArrowRight, TrendingUp, Users, ShoppingBag, DollarSign, Percent, CheckCircle, Package, RefreshCw, Layers, Edit, Upload, Image, X } from "lucide-react";
import { Product, CustomDressRequest, Order } from "../types";

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (prod: any) => void;
  onUpdateProduct: (id: string, prod: any) => void;
  onDeleteProduct: (id: string) => void;
  customRequests: CustomDressRequest[];
  onUpdateBespokeStatus: (id: string, status: any) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: any) => void;
  formatPrice: (price: number) => string;
  categories: string[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onRefreshData?: () => void;
}

const GALLERY_PRESETS = [
  { name: "Crimson Anarkali", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800" },
  { name: "Burgundy Velvet Saree", url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800" },
  { name: "Emerald Kurta Set", url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800" },
  { name: "Fine Embroidery Details", url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1600" },
  { name: "Ivory Lehenga", url: "https://images.unsplash.com/photo-1597176111551-789a33f11fbf?auto=format&fit=crop&q=80&w=800" },
  { name: "Silver Lehenga", url: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=800" },
  { name: "Bridal Dupatta", url: "https://images.unsplash.com/photo-1583391265517-35bbadd01209?auto=format&fit=crop&q=80&w=800" },
  { name: "Bridal Gown & Jewelry", url: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=800" }
];

export default function AdminDashboard({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  customRequests,
  onUpdateBespokeStatus,
  orders,
  onUpdateOrderStatus,
  formatPrice,
  categories = ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRefreshData
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'bespoke' | 'orders' | 'reviews' | 'users'>('products');


  // Customer accounts & Reviews states
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const fetchExtraData = async () => {
    setLoadingExtra(true);
    try {
      const [resRev, resUsr] = await Promise.all([
        fetch("/api/reviews"),
        fetch("/api/users")
      ]);
      if (resRev.ok) {
        const revData = await resRev.json();
        setReviewsList(revData);
      }
      if (resUsr.ok) {
        const usrData = await resUsr.json();
        setUsersList(usrData);
      }
    } catch (err) {
      console.error("Failed to load extra data in admin dashboard:", err);
    } finally {
      setLoadingExtra(false);
    }
  };

  useEffect(() => {
    fetchExtraData();
  }, [activeTab]);

  const handleUpdateReviewStatus = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchExtraData();
        onRefreshData?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchExtraData();
        onRefreshData?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserStatus = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchExtraData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // New Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<any>(categories[0] || "Bridals");
  const [newProdPrice, setNewProdPrice] = useState("");

  useEffect(() => {
    if (categories && categories.length > 0 && !editingProduct) {
      setNewProdCategory(categories[0]);
    }
  }, [categories]);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("");
  const [newProdFabric, setNewProdFabric] = useState("");
  const [newProdEmbroidery, setNewProdEmbroidery] = useState("");
  const [newProdColor, setNewProdColor] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImage, setNewProdImage] = useState("");

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiNotice, setAiNotice] = useState("");

  // AI Description Generator trigger calling server
  const handleAiGenerateDescription = async () => {
    if (!newProdName) {
      alert("Please enter a product name first before generating a description.");
      return;
    }
    setIsGeneratingDesc(true);
    setAiNotice("");
    try {
      const response = await fetch("/api/gemini/generate-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          fabric: newProdFabric || "Pure handwoven silk and velvet overlays",
          embroidery: newProdEmbroidery || "Artisan gold zardozi and antique tilla"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setNewProdDesc(data.description);
        setAiNotice("AI Description generated successfully via Gemini 3.5 Flash!");
      } else {
        alert("Description generation error. Using fallback.");
        setNewProdDesc(data.fallback || "Crafted with gold thread-lay and premium drapes.");
      }
    } catch (err) {
      console.error(err);
      setNewProdDesc(`Introducing the stunning ${newProdName}, a masterpieces crafted in ${newProdFabric || 'raw silk'} detailed with ${newProdEmbroidery || 'heirloom embroidery'}. Fitted perfectly by our master tailors.`);
      setAiNotice("AI description generated (offline simulation fallback completed).");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewProdImage(reader.result);
          setAiNotice("Product image uploaded successfully!");
          setTimeout(() => setAiNotice(""), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setNewProdName(p.name);
    setNewProdCategory(p.category);
    setNewProdPrice(String(p.price));
    setNewProdOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setNewProdFabric(p.fabrics?.[0] || "");
    setNewProdEmbroidery(p.embroidery?.[0] || "");
    setNewProdColor(p.colors?.[0] || "");
    setNewProdDesc(p.description);
    setNewProdImage(p.image);
    setAiNotice(`Editing masterpiece: ${p.name}`);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProdName("");
    setNewProdCategory(categories[0] || "Bridals");
    setNewProdPrice("");
    setNewProdOriginalPrice("");
    setNewProdFabric("");
    setNewProdEmbroidery("");
    setNewProdColor("");
    setNewProdDesc("");
    setNewProdImage("");
    setAiNotice("");
  };

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert("Name and Price are mandatory.");
      return;
    }

    const productPayload = {
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      description: newProdDesc || "A luxurious handcrafted piece from the Muskan Nazar Atelier.",
      image: newProdImage || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      colors: newProdColor ? [newProdColor] : ["Ivory", "Gold"],
      fabrics: newProdFabric ? [newProdFabric] : ["Pure Silk"],
      embroidery: newProdEmbroidery ? [newProdEmbroidery] : ["Hand Embellished"]
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productPayload);
      setAiNotice(`Masterpiece "${newProdName}" successfully updated!`);
      setEditingProduct(null);
    } else {
      onAddProduct(productPayload);
      setAiNotice("Product successfully added to catalog!");
    }

    // Reset Form
    setNewProdName("");
    setNewProdPrice("");
    setNewProdOriginalPrice("");
    setNewProdFabric("");
    setNewProdEmbroidery("");
    setNewProdColor("");
    setNewProdDesc("");
    setNewProdImage("");
    setNewProdCategory(categories[0] || "Bridals");
    setTimeout(() => setAiNotice(""), 3000);
  };

  // Enterprise mock analytical calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 184500); // Seeding initial revenue
  const totalBespokesCount = customRequests.length + 42;
  const averageOrderValue = Math.round(totalRevenue / (orders.length + 65));

  return (
    <div className="bg-[#111] text-[#f5efe4] min-h-screen select-none font-sans p-6 sm:p-10 border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-mono text-[9px] text-amber-400 tracking-[0.4em] uppercase">Enterprise Management System</span>
            </div>
            <h1 className="font-serif text-3xl tracking-widest uppercase mt-2">
              Muskan Nazar <span className="font-sans font-light text-amber-500 text-lg">Suite</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'products', name: 'Couture Inventory' },
              { id: 'categories', name: 'Category Suite' },
              { id: 'bespoke', name: 'Bespoke Inquiries' },
              { id: 'orders', name: 'Purchase Ledgers' },
              { id: 'reviews', name: 'Review Center' },
              { id: 'users', name: 'User Database' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-all duration-300 rounded-xs font-medium ${
                  activeTab === tab.id
                    ? "bg-[#d4af37] text-black font-semibold"
                    : "bg-[#222] text-[#ccc] hover:bg-[#333]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Panel Display */}

        {/* Products Management Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fade-in">
            
            {/* Left: Product List */}
            <div className="lg:col-span-6 bg-[#181818] border border-white/5 p-6 space-y-4 rounded-sm">
              <h3 className="font-serif text-base uppercase tracking-wider text-white border-b border-white/5 pb-2 font-medium">Couture Catalogue</h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[620px] pr-2">
                {products.map((p) => (
                  <div key={p.id} className="flex gap-4 p-3.5 bg-[#222] border border-white/5 justify-between items-center hover:border-amber-500/20 transition-all duration-300">
                    <div className="flex gap-3 items-center">
                      <img src={p.image} alt={p.name} className="w-12 h-16 object-cover border border-white/10" />
                      <div>
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">{p.category}</span>
                        <h4 className="text-xs text-white font-semibold font-sans">{p.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">{formatPrice(p.price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className={`p-2 rounded-xs transition-colors ${
                          editingProduct?.id === p.id 
                            ? "bg-amber-400 text-black font-semibold" 
                            : "text-gray-400 hover:text-amber-400 hover:bg-[#333]"
                        }`}
                        title="Edit masterpiece details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-[#333] transition-colors p-2 rounded-xs"
                        title="Decommission dress"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add / Edit Form with Gemini trigger & Image Uploader / Gallery */}
            <div className="lg:col-span-6 bg-[#181818] border border-white/5 p-6 rounded-sm space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="font-serif text-base uppercase tracking-wider text-white font-medium">
                  {editingProduct ? "Edit Masterpiece" : "Add New Masterpiece"}
                </h3>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-mono uppercase tracking-wider font-semibold"
                  >
                    <X className="w-3 h-3" /> Cancel Edit
                  </button>
                )}
              </div>
              
              {aiNotice && (
                <div className="p-3 bg-amber-500/10 text-amber-300 text-[11px] font-sans border-l-3 border-amber-500 rounded-xs">
                  {aiNotice}
                </div>
              )}

              <form onSubmit={handleAddNewProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Dress Name *</label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs focus:outline-none focus:border-amber-500 text-white"
                      placeholder="e.g. Royal Shahnai Lehenga"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Category *</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value as any)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs focus:outline-none text-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Price (USD) *</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs focus:outline-none text-white font-mono"
                      placeholder="e.g. 5500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Original Price (optional)</label>
                    <input
                      type="number"
                      value={newProdOriginalPrice}
                      onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs focus:outline-none text-white font-mono"
                      placeholder="e.g. 6200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Fabric</label>
                    <input
                      type="text"
                      value={newProdFabric}
                      onChange={(e) => setNewProdFabric(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-1.5 text-xs focus:outline-none text-white"
                      placeholder="Raw Silk"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Embroidery</label>
                    <input
                      type="text"
                      value={newProdEmbroidery}
                      onChange={(e) => setNewProdEmbroidery(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-1.5 text-xs focus:outline-none text-white"
                      placeholder="Zardozi"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Hue</label>
                    <input
                      type="text"
                      value={newProdColor}
                      onChange={(e) => setNewProdColor(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-1.5 text-xs focus:outline-none text-white"
                      placeholder="Heritage Red"
                    />
                  </div>
                </div>

                {/* Real-time Upload / Gallery Section */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Atelier Image Suite</label>
                    <span className="text-[8px] uppercase tracking-widest text-amber-500 font-mono">Upload or Pick</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Device Upload */}
                    <div className="border border-dashed border-white/10 p-3.5 text-center bg-[#222]/30 hover:bg-[#222]/60 hover:border-amber-500/20 transition-all rounded-xs flex flex-col items-center justify-center cursor-pointer relative min-h-[100px]">
                      <Upload className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-[10px] text-gray-300 font-semibold font-sans">Upload Local File</span>
                      <span className="text-[8px] text-gray-500 font-mono mt-0.5">JPEG, PNG or WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                    {/* Thumbnail Preview Area */}
                    <div className="bg-[#1f1f1f] border border-white/5 p-2 rounded-xs flex gap-3 items-center min-h-[100px] overflow-hidden">
                      {newProdImage ? (
                        <>
                          <div className="relative w-12 h-16 shrink-0 bg-black/40 border border-white/10 rounded-xs overflow-hidden">
                            <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewProdImage("")}
                              className="absolute top-0 right-0 p-0.5 bg-black/80 text-red-400 hover:text-white rounded-bl-xs"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[9px] text-gray-400 font-sans truncate pr-2 space-y-1">
                            <span className="text-amber-400 font-bold block uppercase tracking-wider text-[8px]">Selected Image</span>
                            <span className="block text-gray-400 font-mono text-[8px] truncate max-w-[130px]">
                              {newProdImage.startsWith("data:") ? "Local Upload (Base64)" : "Web Image / Preset Link"}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const win = window.open(newProdImage, '_blank');
                                if (win) win.focus();
                              }}
                              className="text-amber-500 hover:underline text-[8px]"
                            >
                              View Full
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 font-mono text-[9px] py-4">
                          <Image className="w-4 h-4 text-gray-600 mb-1" />
                          No image selected
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Link Input */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Or Paste Direct Image Address</label>
                    <input
                      type="text"
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs focus:outline-none text-white font-mono"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>

                  {/* Presets Gallery Picker */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-2">Or Choose from Atelier Gallery Presets</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {GALLERY_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewProdImage(preset.url);
                            setAiNotice(`Preset chosen: ${preset.name}`);
                            setTimeout(() => setAiNotice(""), 2000);
                          }}
                          className={`relative aspect-[3/4] border transition-all rounded-xs overflow-hidden ${
                            newProdImage === preset.url
                              ? "border-amber-400 scale-95 ring-1 ring-amber-400"
                              : "border-white/10 hover:border-amber-500/50"
                          }`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gemini AI button */}
                <div className="border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">Artisan Copywriting</span>
                    <button
                      type="button"
                      disabled={isGeneratingDesc}
                      onClick={handleAiGenerateDescription}
                      className="text-[9px] uppercase text-amber-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>{isGeneratingDesc ? "Consulting Gemini..." : "AI Generate Luxury Desc"}</span>
                    </button>
                  </div>
                  <textarea
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs text-[#ddd] focus:outline-none h-24 resize-none"
                    placeholder="Generative description with high fashion terms..."
                  ></textarea>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 text-black hover:bg-amber-600 transition-colors font-sans text-xs uppercase tracking-widest font-bold"
                  >
                    {editingProduct ? "Update Masterpiece Details" : "Add Product to Catalog"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fade-in">
            {/* Left: Categories List */}
            <div className="lg:col-span-7 bg-[#181818] border border-white/5 p-6 space-y-4 rounded-sm">
              <h3 className="font-serif text-base uppercase tracking-wider text-white border-b border-white/5 pb-2 font-medium">Active Collections & Categories</h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[620px] pr-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex gap-4 p-3.5 bg-[#222] border border-white/5 justify-between items-center hover:border-amber-500/20 transition-all duration-300">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Layers className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-xs text-white font-semibold font-sans uppercase tracking-wider">{cat}</h4>
                        <p className="text-[9px] font-mono text-gray-500">
                          {products.filter(p => p.category === cat).length} Products Assigned
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const newName = prompt(`Rename category "${cat}" to:`, cat);
                          if (newName && newName.trim() !== "" && newName.trim() !== cat) {
                            onUpdateCategory(cat, newName.trim());
                            setAiNotice(`Renamed category "${cat}" to "${newName.trim()}"`);
                            setTimeout(() => setAiNotice(""), 3000);
                          }
                        }}
                        className="text-gray-400 hover:text-amber-400 hover:bg-[#333] transition-colors p-2 rounded-xs"
                        title="Edit Category Name"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete category "${cat}"? Products in this category will be re-assigned.`)) {
                            onDeleteCategory(cat);
                            setAiNotice(`Deleted category "${cat}"`);
                            setTimeout(() => setAiNotice(""), 3000);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 hover:bg-[#333] transition-colors p-2 rounded-xs"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add New Category Form */}
            <div className="lg:col-span-5 bg-[#181818] border border-white/5 p-6 rounded-sm space-y-6">
              <h3 className="font-serif text-base uppercase tracking-wider text-white border-b border-white/5 pb-3 font-medium">Add New Collection</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const name = formData.get("categoryName") as string;
                if (!name || name.trim() === "") {
                  alert("Please enter a category name");
                  return;
                }
                if (categories.includes(name.trim())) {
                  alert("This category already exists");
                  return;
                }
                onAddCategory(name.trim());
                setAiNotice(`Collection "${name.trim()}" added successfully!`);
                setTimeout(() => setAiNotice(""), 3000);
                form.reset();
              }} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Collection / Category Name *</label>
                  <input
                    type="text"
                    name="categoryName"
                    required
                    className="w-full bg-[#222] border border-white/5 py-1.5 px-2 text-xs focus:outline-none focus:border-amber-500 text-white font-sans"
                    placeholder="e.g. Formal Velvet Edition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 text-black hover:bg-amber-600 transition-colors font-sans text-xs uppercase tracking-widest font-bold"
                >
                  Create Collection
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bespoke Requests Tab */}
        {activeTab === 'bespoke' && (
          <div className="bg-[#181818] border border-white/5 p-6 space-y-6 animate-fade-in">
            <h3 className="font-serif text-base uppercase tracking-wider text-white border-b border-white/5 pb-2 font-medium">Bespoke Silhouette Drafts</h3>
            
            {customRequests.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10 font-sans">No Custom Requests Submitted Yet.</p>
            ) : (
              <div className="space-y-6">
                {customRequests.map((req) => (
                  <div key={req.id} className="bg-[#222] border border-white/5 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-2">
                      <div>
                        <h4 className="text-xs font-sans text-white font-semibold">{req.customerName} ({req.customerEmail})</h4>
                        <span className="text-[9px] font-mono text-gray-500 block mt-1">Request ID: {req.id} | Event: {req.eventType}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-sans text-gray-400 uppercase tracking-widest">Status:</span>
                        <select
                          value={req.status}
                          onChange={(e) => onUpdateBespokeStatus(req.id, e.target.value as any)}
                          className="bg-[#111] border border-white/10 text-[10px] uppercase font-mono py-1 px-2 focus:outline-none text-amber-400 font-bold"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="In Production">In Production</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                      
                      {/* Measurements table */}
                      <div className="space-y-1.5 font-mono text-[10px] bg-[#111] p-3 rounded-xs border border-white/5">
                        <p className="font-sans text-[9px] uppercase tracking-wider text-amber-500 font-semibold mb-2">Posture Proportions</p>
                        <p>Height: <span className="text-white font-semibold">{req.measurements.height}</span></p>
                        <p>Bust: <span className="text-white font-semibold">{req.measurements.bust}</span></p>
                        <p>Waist: <span className="text-white font-semibold">{req.measurements.waist}</span></p>
                        <p>Hips: <span className="text-white font-semibold">{req.measurements.hips}</span></p>
                        <p>Shoulder: <span className="text-white font-semibold">{req.measurements.shoulderWidth}</span></p>
                        <p>Sleeve: <span className="text-white font-semibold">{req.measurements.sleeveLength}</span></p>
                        <p>Length: <span className="text-white font-semibold">{req.measurements.dressLength}</span></p>
                      </div>

                      {/* Fabrication and budget details */}
                      <div className="space-y-1.5 text-xs font-sans">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-amber-500 font-semibold">Custom Specifications</p>
                        <p className="text-gray-400">Fabric: <span className="text-white font-semibold">{req.fabric}</span></p>
                        <p className="text-gray-400">Preferred Color: <span className="text-white font-semibold">{req.color}</span></p>
                        <p className="text-gray-400">Embroidery: <span className="text-white font-semibold">{req.embroideryStyle}</span></p>
                        <p className="text-gray-400">Budget Limit: <span className="text-amber-400 font-semibold">{req.budget || "Unspecified"}</span></p>
                        <p className="text-gray-400 mt-2 block font-light leading-relaxed bg-[#1a1a1a] p-2 border border-white/5 italic">"{req.additionalNotes || 'No additional custom requirements written.'}"</p>
                      </div>

                      {/* Reference image rendering */}
                      {req.referenceImage && (
                        <div className="space-y-1.5 text-xs font-sans">
                          <p className="text-[9px] font-mono uppercase tracking-wider text-amber-500 font-semibold">Inspiration File</p>
                          <img src={req.referenceImage} alt="Reference blueprint" className="w-24 h-24 object-cover border border-white/10 shadow-md rounded-xs" />
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-[#181818] border border-white/5 p-6 space-y-6 animate-fade-in">
            <h3 className="font-serif text-base uppercase tracking-wider text-white border-b border-white/5 pb-2 font-medium">Creation purchase ledgers</h3>
            
            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10 font-sans">No Orders Logged Yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-[#222] border border-white/5 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-2">
                      <div>
                        <h4 className="text-xs font-sans text-white font-semibold">{order.customerName} ({order.customerEmail})</h4>
                        <span className="text-[9px] font-mono text-gray-500 block mt-1">Invoice ID: {order.id} | Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-300">
                          <span>Total Amount:</span>
                          <span className="text-amber-400 font-bold">{formatPrice(order.totalAmount)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={order.shippingStatus}
                            onChange={(e) => onUpdateOrderStatus(order.id, { shippingStatus: e.target.value })}
                            className="bg-[#111] border border-white/10 text-[10px] uppercase font-mono py-1 px-2 focus:outline-none text-white"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500 font-semibold block">Purchased Creations</span>
                      <div className="space-y-1.5">
                        {order.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-gray-300 font-sans py-1 border-b border-white/5">
                            <span>{it.productName} (Qty: {it.quantity}) - {it.selectedColor} / {it.selectedFabric} [Size: {it.selectedSize}]</span>
                            <span className="font-mono text-white">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-[#181818] border border-white/5 p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-base uppercase tracking-wider text-white font-medium">Verified Customer Diaries</h3>
              <button onClick={fetchExtraData} className="text-xs text-amber-400 hover:underline">Refresh List</button>
            </div>

            {reviewsList.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10 font-sans">No review records found in database.</p>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-[#222] border border-white/5 p-4 rounded-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xs font-semibold text-white">{rev.customerName}</span>
                        <span className="text-[9px] font-mono text-amber-500">({rev.rating} Stars)</span>
                        {rev.verified && <span className="bg-amber-400/10 text-amber-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">Verified</span>}
                        {rev.approved ? (
                          <span className="bg-green-500/10 text-green-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">Approved</span>
                        ) : (
                          <span className="bg-red-500/10 text-red-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">Rejected</span>
                        )}
                        {rev.featured && <span className="bg-yellow-500/10 text-yellow-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">Featured</span>}
                      </div>
                      <p className="text-xs text-gray-300 font-light italic">"{rev.comment}"</p>
                      <p className="text-[9px] text-gray-500 font-mono">Date: {rev.date} | Product ID: {rev.productId}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, { approved: true })}
                        className="px-2.5 py-1.5 bg-green-700 hover:bg-green-600 text-white font-sans text-[10px] uppercase font-bold rounded-xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, { approved: false })}
                        className="px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white font-sans text-[10px] uppercase font-bold rounded-xs cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateReviewStatus(rev.id, { featured: !rev.featured })}
                        className="px-2.5 py-1.5 bg-[#444] hover:bg-amber-500 hover:text-black text-white font-sans text-[10px] uppercase font-bold rounded-xs cursor-pointer"
                      >
                        {rev.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-[#181818] border border-white/5 p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-base uppercase tracking-wider text-white font-medium">Customer Registry</h3>
              <button onClick={fetchExtraData} className="text-xs text-amber-400 hover:underline">Refresh List</button>
            </div>

            {usersList.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10 font-sans">No users registered yet.</p>
            ) : (
              <div className="space-y-4">
                {usersList.map((user) => (
                  <div key={user.id} className="bg-[#222] border border-white/5 p-4 rounded-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xs font-semibold text-white">{user.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">({user.email})</span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-[#111] text-[#C5A059] border border-[#C5A059]/20">{user.role}</span>
                        {user.isDisabled && <span className="bg-red-500/20 text-red-400 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">Disabled</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans">Addresses Cataloged: {user.addresses?.length || 0} | Sizing set: {user.measurements ? "Yes" : "No"}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          alert(`Reset link simulated for patron: ${user.email}`);
                        }}
                        className="px-2.5 py-1.5 bg-[#333] hover:bg-[#444] text-white font-sans text-[10px] uppercase font-bold rounded-xs cursor-pointer"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleUpdateUserStatus(user.id, { isDisabled: !user.isDisabled })}
                        className={`px-2.5 py-1.5 font-sans text-[10px] uppercase font-bold rounded-xs cursor-pointer ${
                          user.isDisabled
                            ? "bg-green-700 hover:bg-green-600 text-white"
                            : "bg-red-800 hover:bg-red-700 text-white"
                        }`}
                      >
                        {user.isDisabled ? "Enable User" : "Disable User"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

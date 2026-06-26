import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

// Interfaces matching types.ts
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  description: string;
  image: string;
  gallery: string[];
  colors: string[];
  fabrics: string[];
  embroidery: string[];
  occasions: string[];
  sizes: string[];
  inStock: boolean;
  estimatedDelivery: string;
  fabricDetails: string;
  embroideryDetails: string;
  careInstructions: string;
}

interface Measurement {
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoulderWidth: string;
  sleeveLength: string;
  dressLength: string;
}

interface CustomDressRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  measurements: Measurement;
  referenceImage?: string;
  fabric: string;
  color: string;
  embroideryStyle: string;
  eventType: string;
  additionalNotes: string;
  budget?: string;
  status: 'Pending' | 'Approved' | 'In Production' | 'Shipped' | 'Delivered';
  createdAt: string;
}

interface OrderItem {
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

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  gstAmount: number;
  currency: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  shippingStatus: 'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Return Requested' | 'Returned';
  trackingNumber?: string;
  createdAt: string;
  invoiceUrl?: string;
}

interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerId?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  approved: boolean;
  featured: boolean;
  photoUrl?: string;
  videoUrl?: string;
}

interface Notification {
  id: string;
  text: string;
  type: 'order' | 'review' | 'custom';
  unread: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'customer';
  verified: boolean;
  profilePicture?: string;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
  measurements: Partial<Measurement>;
  wishlist: string[];
  isDisabled: boolean;
}

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  customRequests: CustomDressRequest[];
  reviews: Review[];
  notifications: Notification[];
  coupons: Array<{ id: string; code: string; discountPercent: number }>;
  blogs: Array<{ id: string; title: string; content: string; image: string; date: string }>;
  categories?: string[];
}

const DB_PATH = path.join(process.cwd(), "db.json");

// Helper to safely read database
async function getDB(): Promise<DatabaseSchema> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      parsed.categories = ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"];
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read database file, returning blank schema.", err);
    return {
      products: [],
      users: [],
      orders: [],
      customRequests: [],
      reviews: [],
      notifications: [],
      coupons: [],
      blogs: [],
      categories: ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"]
    };
  }
}

// Helper to safely write database
async function saveDB(data: DatabaseSchema): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file.", err);
  }
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully on server-side.");
  } catch (err) {
    console.error("Error initializing Gemini API client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY env variable found. Operating in local intelligent mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter your name, email, and password." });
    }

    const db = await getDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password, // Plain text for mock / demo persistence
      role: 'customer',
      verified: false,
      addresses: [],
      measurements: {},
      wishlist: [],
      isDisabled: false
    };

    db.users.push(newUser);
    await saveDB(db);

    res.status(201).json({
      success: true,
      message: "Registration successful. A verification prompt has been initiated.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        verified: newUser.verified,
        addresses: newUser.addresses,
        measurements: newUser.measurements,
        wishlist: newUser.wishlist
      }
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const db = await getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your email and password." });
    }

    if (user.isDisabled) {
      return res.status(403).json({ error: "This user profile has been disabled by administrators." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        profilePicture: user.profilePicture,
        addresses: user.addresses,
        measurements: user.measurements,
        wishlist: user.wishlist
      }
    });
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const db = await getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ error: "User not found." });

    user.verified = true;
    await saveDB(db);

    res.json({ success: true, message: "Email has been successfully verified." });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: "Email and new password are required." });

    const db = await getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ error: "User not found." });

    user.password = newPassword;
    await saveDB(db);

    res.json({ success: true, message: "Password has been successfully updated." });
  });

  app.put("/api/auth/profile", async (req, res) => {
    const { id, name, addresses, measurements, wishlist, profilePicture } = req.body;
    if (!id) return res.status(400).json({ error: "User ID is required." });

    const db = await getDB();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: "User profile not found." });

    const user = db.users[index];
    if (name !== undefined) user.name = name;
    if (addresses !== undefined) user.addresses = addresses;
    if (measurements !== undefined) user.measurements = measurements;
    if (wishlist !== undefined) user.wishlist = wishlist;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await saveDB(db);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        profilePicture: user.profilePicture,
        addresses: user.addresses,
        measurements: user.measurements,
        wishlist: user.wishlist
      }
    });
  });

  app.get("/api/auth/users", async (req, res) => {
    const db = await getDB();
    const sanitized = db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      verified: u.verified,
      isDisabled: u.isDisabled,
      addressesCount: u.addresses?.length || 0
    }));
    res.json(sanitized);
  });

  app.put("/api/auth/users/:id/toggle", async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isDisabled = !user.isDisabled;
    await saveDB(db);
    res.json({ success: true, isDisabled: user.isDisabled });
  });

  // ==========================================
  // CATEGORIES API
  // ==========================================

  app.get("/api/categories", async (req, res) => {
    const db = await getDB();
    res.json(db.categories || ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"]);
  });

  app.post("/api/categories", async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required" });
    }
    const db = await getDB();
    if (!db.categories) db.categories = ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"];
    
    const trimmed = name.trim();
    if (db.categories.includes(trimmed)) {
      return res.status(400).json({ error: "Category already exists" });
    }
    db.categories.push(trimmed);
    await saveDB(db);
    res.json(db.categories);
  });

  app.put("/api/categories", async (req, res) => {
    const { oldName, newName } = req.body;
    if (!oldName || !newName || typeof oldName !== "string" || typeof newName !== "string") {
      return res.status(400).json({ error: "oldName and newName are required" });
    }
    const db = await getDB();
    if (!db.categories) db.categories = ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"];
    
    const idx = db.categories.indexOf(oldName.trim());
    if (idx === -1) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    const targetNew = newName.trim();
    db.categories[idx] = targetNew;

    // Renaming matching products to new category name
    db.products.forEach(p => {
      if (p.category === oldName.trim()) {
        p.category = targetNew;
      }
    });

    await saveDB(db);
    res.json(db.categories);
  });

  app.delete("/api/categories/:name", async (req, res) => {
    const { name } = req.params;
    const db = await getDB();
    if (!db.categories) db.categories = ["Bridals", "Luxury Formals", "Bespoke Couture", "Ready-to-Wear"];
    
    db.categories = db.categories.filter(c => c !== name);

    // Update products belonging to deleted category to be a valid one
    const backupCategory = db.categories[0] || "Uncategorized";
    db.products.forEach(p => {
      if (p.category === name) {
        p.category = backupCategory;
      }
    });

    await saveDB(db);
    res.json(db.categories);
  });

  // ==========================================
  // PRODUCTS API
  // ==========================================

  app.get("/api/products", async (req, res) => {
    const db = await getDB();
    res.json(db.products);
  });

  app.post("/api/products", async (req, res) => {
    const newProd = req.body;
    if (!newProd.name || !newProd.category || !newProd.price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const db = await getDB();
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: newProd.name,
      category: newProd.category,
      price: Number(newProd.price),
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
      rating: 5.0,
      reviewsCount: 0,
      description: newProd.description || "Crafted to perfection.",
      image: newProd.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      gallery: newProd.gallery || [newProd.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800"],
      colors: newProd.colors || ["Ivory", "Custom"],
      fabrics: newProd.fabrics || ["Silk"],
      embroidery: newProd.embroidery || ["Hand Embellished"],
      occasions: newProd.occasions || ["Formal"],
      sizes: newProd.sizes || ["XS", "S", "M", "L", "XL", "Custom"],
      inStock: true,
      estimatedDelivery: newProd.estimatedDelivery || "4-6 Weeks",
      fabricDetails: newProd.fabricDetails || "Premium fabric.",
      embroideryDetails: newProd.embroideryDetails || "Beautiful hand craft.",
      careInstructions: newProd.careInstructions || "Specialist dry clean only."
    };
    db.products.unshift(product);
    await saveDB(db);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    db.products[index] = { ...db.products[index], ...req.body };
    await saveDB(db);
    res.json(db.products[index]);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    db.products = db.products.filter(p => p.id !== id);
    await saveDB(db);
    res.json({ success: true, id });
  });

  // ==========================================
  // REVIEW SYSTEM ENDPOINTS
  // ==========================================

  app.get("/api/reviews", async (req, res) => {
    const db = await getDB();
    res.json(db.reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    const { productId, customerName, customerEmail, rating, comment, photoUrl, videoUrl } = req.body;
    if (!productId || !customerName || !customerEmail || !rating || !comment) {
      return res.status(400).json({ error: "Please enter product, name, email, rating, and feedback." });
    }

    const db = await getDB();

    // Verify purchase
    const hasPurchased = db.orders.some(order => 
      order.customerEmail.toLowerCase() === customerEmail.toLowerCase() &&
      order.items.some(item => item.productId === productId)
    );

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      customerName,
      customerEmail,
      rating: Number(rating),
      comment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      verified: hasPurchased,
      approved: true, // Defaulting auto-approved so they show up, can be edited in Admin
      featured: false,
      photoUrl,
      videoUrl
    };

    db.reviews.unshift(newReview);

    // Update product rating and count
    const product = db.products.find(p => p.id === productId);
    if (product) {
      const pReviews = db.reviews.filter(r => r.productId === productId && r.approved);
      const avg = pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length;
      product.rating = Number(avg.toFixed(1)) || Number(rating);
      product.reviewsCount = pReviews.length;
    }

    // Push notification to administrators
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: `New review submitted by ${customerName} (${rating} Stars) for ${product?.name || "Product"}.`,
      type: "review",
      unread: true,
      createdAt: new Date().toISOString()
    });

    await saveDB(db);
    res.status(201).json(newReview);
  });

  app.put("/api/reviews/:id/approve", async (req, res) => {
    const { id } = req.params;
    const { approved, featured } = req.body;

    const db = await getDB();
    const review = db.reviews.find(r => r.id === id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (approved !== undefined) review.approved = approved;
    if (featured !== undefined) review.featured = featured;

    // Recalculate average rating of associated product
    const product = db.products.find(p => p.id === review.productId);
    if (product) {
      const pReviews = db.reviews.filter(r => r.productId === review.productId && r.approved);
      if (pReviews.length > 0) {
        product.rating = Number((pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1));
        product.reviewsCount = pReviews.length;
      } else {
        product.rating = 5.0;
        product.reviewsCount = 0;
      }
    }

    await saveDB(db);
    res.json(review);
  });

  app.put("/api/reviews/:id", async (req, res) => {
    const { id } = req.params;
    const { approved, featured } = req.body;

    const db = await getDB();
    const review = db.reviews.find(r => r.id === id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (approved !== undefined) review.approved = approved;
    if (featured !== undefined) review.featured = featured;

    // Recalculate average rating of associated product
    const product = db.products.find(p => p.id === review.productId);
    if (product) {
      const pReviews = db.reviews.filter(r => r.productId === review.productId && r.approved);
      if (pReviews.length > 0) {
        product.rating = Number((pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1));
        product.reviewsCount = pReviews.length;
      } else {
        product.rating = 5.0;
        product.reviewsCount = 0;
      }
    }

    await saveDB(db);
    res.json(review);
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    
    const review = db.reviews.find(r => r.id === id);
    if (review) {
      db.reviews = db.reviews.filter(r => r.id !== id);
      
      const product = db.products.find(p => p.id === review.productId);
      if (product) {
        const pReviews = db.reviews.filter(r => r.productId === review.productId && r.approved);
        if (pReviews.length > 0) {
          product.rating = Number((pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1));
          product.reviewsCount = pReviews.length;
        } else {
          product.rating = 5.0;
          product.reviewsCount = 0;
        }
      }
    }

    await saveDB(db);
    res.json({ success: true, id });
  });

  // ==========================================
  // BESPOKE CUSTOM DRESS API
  // ==========================================

  app.get("/api/bespoke/requests", async (req, res) => {
    const db = await getDB();
    res.json(db.customRequests);
  });

  app.post("/api/bespoke/request", async (req, res) => {
    const { customerName, customerEmail, customerPhone, measurements, fabric, color, embroideryStyle, eventType, additionalNotes, budget, referenceImage } = req.body;
    if (!customerName || !customerEmail || !measurements) {
      return res.status(400).json({ error: "Name, email, and measurements are required." });
    }

    const db = await getDB();
    const newRequest: CustomDressRequest = {
      id: `bespoke-${Date.now()}`,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      measurements,
      referenceImage,
      fabric,
      color,
      embroideryStyle,
      eventType,
      additionalNotes,
      budget,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    db.customRequests.unshift(newRequest);

    // Sync measurements to user profile if logged in
    const user = db.users.find(u => u.email.toLowerCase() === customerEmail.toLowerCase());
    if (user) {
      user.measurements = measurements;
    }

    // Add administrative notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: `New Bespoke couture request received from ${customerName} for a ${eventType} dress.`,
      type: "custom",
      unread: true,
      createdAt: new Date().toISOString()
    });

    await saveDB(db);
    res.status(201).json({ success: true, request: newRequest });
  });

  app.put("/api/bespoke/requests/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const db = await getDB();
    const index = db.customRequests.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: "Bespoke request not found" });

    db.customRequests[index].status = status;
    await saveDB(db);
    res.json(db.customRequests[index]);
  });

  // ==========================================
  // ORDERS & CHEKOUT API (GST, INVOICES, RETURNS)
  // ==========================================

  app.get("/api/orders", async (req, res) => {
    const db = await getDB();
    res.json(db.orders);
  });

  app.post("/api/orders", async (req, res) => {
    const { customerName, customerEmail, customerPhone, customerId, items, totalAmount, currency, shippingAddress, paymentMethod } = req.body;
    if (!customerName || !customerEmail || !items || !items.length) {
      return res.status(400).json({ error: "Customer details and order items are required" });
    }

    const db = await getDB();

    // Indian taxation model: 18% GST calculation included for Indian invoices
    const gstRate = 0.18;
    const isIndia = shippingAddress.country?.toLowerCase() === "india";
    const calculatedGst = isIndia ? Math.round(totalAmount * (gstRate / (1 + gstRate))) : 0;

    const orderId = `MN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      customerId,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      items,
      totalAmount,
      gstAmount: calculatedGst,
      currency: currency || "INR",
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      shippingStatus: "Pending",
      createdAt: new Date().toISOString(),
      invoiceUrl: `/api/orders/${orderId}/invoice`
    };

    db.orders.unshift(newOrder);

    // Log admin notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: `New order ${orderId} placed by ${customerName} (₹${totalAmount.toLocaleString()}).`,
      type: "order",
      unread: true,
      createdAt: new Date().toISOString()
    });

    await saveDB(db);
    res.status(201).json(newOrder);
  });

  app.put("/api/orders/:id", async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    const index = db.orders.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    db.orders[index] = { ...db.orders[index], ...req.body };
    await saveDB(db);
    res.json(db.orders[index]);
  });

  // Returns management
  app.post("/api/orders/:id/return", async (req, res) => {
    const { id } = req.params;
    const { reason, comment } = req.body;

    const db = await getDB();
    const order = db.orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.shippingStatus = "Return Requested";
    
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      text: `Return requested for order ${id} by ${order.customerName}. Reason: ${reason || "Fitting adjustment"}.`,
      type: "order",
      unread: true,
      createdAt: new Date().toISOString()
    });

    await saveDB(db);
    res.json({ success: true, order });
  });

  // Serve GST-ready HTML Invoice
  app.get("/api/orders/:id/invoice", async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    const order = db.orders.find(o => o.id === id);
    if (!order) return res.status(404).send("Invoice not found.");

    const isIndia = order.shippingAddress.country?.toLowerCase() === "india";
    const subtotal = order.totalAmount - order.gstAmount;

    // Direct elegant GST invoice generation
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id} - Muskan Nazar</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #121212; line-height: 1.6; margin: 0; padding: 40px; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #eae6db; padding: 40px; background-color: #ffffff; }
          .header { display: flex; justify-content: space-between; border-b: 1px solid #eae6db; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-family: 'Times New Roman', serif; font-size: 24px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 300; }
          .title { font-size: 11px; text-transform: uppercase; color: #C5A059; letter-spacing: 0.2em; font-weight: bold; margin-top: 4px; }
          .invoice-details { text-align: right; font-size: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; font-size: 13px; }
          .billing h3, .shipping h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #C5A059; border-bottom: 1px solid #FAF9F6; pb: 4px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
          th { background-color: #FAF9F6; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #eae6db; }
          td { padding: 12px; border-bottom: 1px solid #f9f9f9; }
          .totals { margin-left: auto; width: 300px; font-size: 13px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .totals-row.grand { border-top: 1px solid #C5A059; font-weight: bold; font-size: 15px; padding-top: 12px; }
          .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #999; border-top: 1px solid #f0f0f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="logo">Muskan Nazar</div>
              <div class="title">Bespoke Haute Couture</div>
            </div>
            <div class="invoice-details">
              <strong>Invoice:</strong> #${order.id}<br/>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br/>
              <strong>Status:</strong> ${order.paymentStatus}<br/>
              <strong>GSTIN:</strong> 07AAAAA1111A1Z1 (Atelier Central)
            </div>
          </div>

          <div class="grid">
            <div class="billing">
              <h3>Billed To</h3>
              <strong>${order.customerName}</strong><br/>
              Email: ${order.customerEmail}<br/>
              ${order.customerPhone ? "Phone: " + order.customerPhone : ""}
            </div>
            <div class="shipping">
              <h3>Shipping Destination</h3>
              ${order.shippingAddress.street}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br/>
              <strong>${order.shippingAddress.country}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Masterpiece</th>
                <th>Custom Options</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.productName}</strong><br/>
                    <span style="font-size: 11px; color: #666;">Size: ${item.selectedSize} | Color: ${item.selectedColor}</span>
                  </td>
                  <td style="font-size: 11px;">
                    ${item.isCustomized ? "Bespoke Sculpted Silhouette Fit" : "Standard Ready To Wear"}
                  </td>
                  <td style="text-align: right;">${order.currency} ${item.price.toLocaleString()}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${order.currency} ${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${order.currency} ${subtotal.toLocaleString()}</span>
            </div>
            ${isIndia ? `
              <div class="totals-row">
                <span>Integrated GST (18% included):</span>
                <span>${order.currency} ${order.gstAmount.toLocaleString()}</span>
              </div>
            ` : ""}
            <div class="totals-row">
              <span>DHL Insured Worldwide Shipping:</span>
              <span>FREE</span>
            </div>
            <div class="totals-row grand">
              <span>Grand Total:</span>
              <span>${order.currency} ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for patronizing Muskan Nazar. This is a GST-ready digital invoice generated automatically.<br/>
            For fitting guarantee claims or delivery returns, please contact WhatsApp concierge or customercare@muskannazar.com
          </div>
        </div>
      </body>
      </html>
    `;
    res.send(invoiceHTML);
  });

  // ==========================================
  // NOTIFICATIONS & COUPONS API
  // ==========================================

  app.get("/api/notifications", async (req, res) => {
    const db = await getDB();
    res.json(db.notifications);
  });

  app.post("/api/notifications/read", async (req, res) => {
    const db = await getDB();
    db.notifications.forEach(n => n.unread = false);
    await saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/coupons/validate", async (req, res) => {
    const { code } = req.body;
    const db = await getDB();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === code?.toUpperCase());
    if (coupon) {
      res.json({ valid: true, discountPercent: coupon.discountPercent });
    } else {
      res.json({ valid: false, error: "Invalid coupon code" });
    }
  });

  // ==========================================
  // DYNAMIC LUXURY STYLIST & DESC (GEMINI)
  // ==========================================

  app.post("/api/gemini/generate-desc", async (req, res) => {
    const { name, category, fabric, embroidery } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Product name is required" });
    }

    if (!ai) {
      const desc = `The stunning ${name} represents the pinnacle of Muskan Nazar's ${category || 'contemporary'} line. Tailored from the finest ${fabric || 'luxury silks'}, it is elegantly finished with ${embroidery || 'handwoven artisanal tilla'} embroidery. This masterpiece blends heritage craftsmanship with sleek modern silhouettes, promising custom couture-level perfection for high-end celebrations. Dry clean only. Worldwide premium delivery included.`;
      return res.json({ description: desc });
    }

    try {
      const prompt = `Write a breathtakingly luxurious, high-end, and deeply poetic product description for a premium fashion item.
      Product Name: ${name}
      Product Category: ${category}
      Key Fabric: ${fabric || 'Premium Handwoven Silks'}
      Embroidery Type: ${embroidery || 'Intricate Handcrafted Embellishments'}

      Write a detailed, high-fashion narrative suitable for prestigious brands like Dior, Elie Saab, and Sabyasachi. Incorporate rich imagery, the feel of the fabric, the hours of delicate heritage handcraft, the tailored perfect fit, and its worldwide couture exclusivity. Keep the tone sophisticated, elegant, and poetic, ending with a brief styling tip.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const generatedText = response.text || "Crafted to perfection. Exclusive luxury by Muskan Nazar.";
      res.json({ description: generatedText.trim() });
    } catch (err: any) {
      console.error("Gemini description generation error:", err);
      res.status(500).json({ error: "AI description generation failed. Using premium template instead.", fallback: `A luxurious piece of art, the ${name} is hand-crafted in ${fabric || 'pure silk'} and detailed with elegant ${embroidery || 'classic tilla'} threadwork. Designed for luxury occasions, delivering worldwide with perfect tailor-made fitting.` });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const sysInstruction = `You are 'Muskan Nazar AI Stylist', the elite virtual concierge for Muskan Nazar - an international ultra-luxury couture fashion house specializing in modern bridal wear, hand-tailored formals, and bespoke custom gowns.
    - Your tone must be charming, refined, articulate, incredibly polite, and highly prestigious (like a top-tier personal designer in Paris, Milan, or London).
    - You know everything about heritage South Asian craftsmanship: intricate Zardozi, Tilla embroidery, Gota-patti, Dabka, Resham work, hand-beading, mirror-work, and luxurious fabrics like pure raw silk, Jamawar, tissue, metallic crushed organza, and velvet.
    - Guide clients on standard sizes, custom bridal measurements (height, bust, waist, hips, etc.), fabric weights, necklines, dupatta styles, worldwide express courier shipping, and bespoke custom tailoring.
    - Recommend our key pieces: "The Shahzadi Heirloom Bridal" (Heritage Red masterpiece, ₹5,50,000), "The Dilruba Mughal Peshwas" (Champagne Gold Peshwas, ₹2,40,000), "The Noor-ul-Ain Gown" (Slate Blue reception stunner, ₹3,60,000), and "The Jasmine Pearl Peplum Set" (₹95,000).
    - Always represent worldwide delivery, 1-on-1 video consultations, premium bespoke tailoring, and timeless heritage elegance. Keep answers concise, highly elegant, and helpful.`;

    if (!ai) {
      let reply = "Welcome to Muskan Nazar. I am your personal luxury stylist concierge. ";
      const msgLower = message.toLowerCase();
      if (msgLower.includes("bridal") || msgLower.includes("wedding") || msgLower.includes("shahzadi")) {
        reply += "Our crown jewel is 'The Shahzadi Heirloom Bridal', meticulously hand-stitched over 400 hours with antique gold zardozi on crimson silk velvet. We also provide bespoke custom bridal consultations where we draft custom sketches according to your unique bridal silhouette. Would you like to enter your custom measurements in our Bespoke Suite?";
      } else if (msgLower.includes("size") || msgLower.includes("fit") || msgLower.includes("measurement")) {
        reply += "Muskan Nazar offers flawless bespoke fitting. You can easily submit your measurements (bust, waist, hips, height, shoulder width) directly in our 'Bespoke Couture' section, and our master tailors will sculpt the outfit perfectly to your proportions. How may I assist you with sizing today?";
      } else if (msgLower.includes("shipping") || msgLower.includes("delivery") || msgLower.includes("deliver")) {
        reply += "We offer insured, premium worldwide delivery via DHL Express. Bridals take 8 to 12 weeks, Luxury Formals take 4 to 6 weeks, and Ready-to-Wear pieces arrive within 7 to 10 business days. Custom tracking and high-end protective packaging are included.";
      } else {
        reply += "It is my absolute pleasure to guide your styling today. Whether you are seeking our signature 'Dilruba Peshwas', planning bespoke wedding couture, or need assistance selecting the most delicate raw silk fabrics, I am here to elevate your wardrobe. What celebration are we designing for?";
      }
      return res.json({ text: reply });
    }

    try {
      const contentsList: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contentsList.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });
      }
      contentsList.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "I am here to guide your luxury selection. How else can I assist you with your styling dreams?" });
    } catch (err: any) {
      console.error("Gemini Stylist Chat Error:", err);
      res.status(500).json({ error: "AI Chat failed. Operating in local mode.", text: "My apologies, there was a connection glitch. I would love to guide you on our beautiful custom silhouettes or explain the vintage zardozi work on our luxury Bridals. What can I design for you today?" });
    }
  });

  // Serving static or dev files
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Development Mode: Vite middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production Mode: Static serving from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

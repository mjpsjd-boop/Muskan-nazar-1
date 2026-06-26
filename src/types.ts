export interface Product {
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

export interface Measurement {
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoulderWidth: string;
  sleeveLength: string;
  dressLength: string;
}

export interface CustomDressRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  measurements: Measurement;
  referenceImage?: string; // base64 or URL
  fabric: string;
  color: string;
  embroideryStyle: string;
  eventType: string;
  additionalNotes: string;
  budget?: string;
  status: 'Pending' | 'Approved' | 'In Production' | 'Shipped' | 'Delivered';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  approved?: boolean;
  featured?: boolean;
  photo?: string;
  videoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
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
  isDisabled?: boolean;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedColor: string;
    selectedFabric: string;
    selectedSize: string;
    isCustomized: boolean;
    customMeasurements?: Measurement;
  }[];
  totalAmount: number;
  gstAmount?: number;
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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
}


export type UserRole = 'customer' | 'vendor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface VendorProfile {
  uid: string;
  storeName: string;
  description: string;
  logoURL?: string;
  status: 'pending' | 'approved' | 'suspended';
  revenue: number;
  createdAt: string;
}

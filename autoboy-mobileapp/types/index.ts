export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  image2?: string;
  image3?: string;
  category: string;
  condition: string;
  description: string;
  sellerId: string;
  location?: { latitude: number; longitude: number };
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1..5
  text: string;
  date: string; // ISO
};

export type CartItem = {
  id: string; // product id
  title: string;
  price: number;
  qty: number;
};

export type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type Order = {
  id: string;
  date: string;
  total: number;
  status?: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
  tracking?: string;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  escrowId?: string;
  disputeId?: string;
};

export type Message = {
  sender: 'me' | 'them';
  text?: string;
  imageUri?: string;
  timestamp?: string;
  type?: 'text' | 'image' | 'file';
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  verified: boolean;
  premium: boolean;
  rating?: number;
  joinDate: string;
};

export type SwapDeal = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromItemId: string;
  toItemId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  escrowId?: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'order' | 'message' | 'swap' | 'system' | 'promotion';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
};

export type ShippingInfo = {
  trackingNumber: string;
  carrier: 'FABS' | 'DHL' | 'FedEx';
  estimatedDelivery: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'delivered';
  updates: ShippingUpdate[];
};

export type ShippingUpdate = {
  timestamp: string;
  status: string;
  location: string;
  description: string;
};

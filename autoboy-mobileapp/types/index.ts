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
  id?: string;
  conversation_id?: string;
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

// New types for enhanced features
export type Dispute = {
  id: string;
  orderId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  reason: 'not_received' | 'damaged' | 'not_as_described' | 'counterfeit' | 'wrong_item' | 'refund_issue' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';
  disputedAmount: number;
  evidenceCount: number;
  createdAt: string;
  resolvedAt?: string;
};

export type DisputeEvidence = {
  id: string;
  disputeId: string;
  type: 'image' | 'video' | 'document' | 'screenshot';
  title: string;
  description?: string;
  fileUrl: string;
  uploadedAt: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'achievement' | 'verification' | 'milestone' | 'special';
  category: 'trading' | 'community' | 'quality' | 'loyalty';
  level: number;
  earnedAt?: string;
};

export type RewardPoints = {
  userId: string;
  currentPoints: number;
  totalEarned: number;
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  nextTierPoints: number;
  lifetimePoints: number;
};

export type Report = {
  id: string;
  type: 'product' | 'user' | 'review' | 'message' | 'listing';
  reason: 'scam' | 'fraud' | 'counterfeit' | 'inappropriate_content' | 'spam' | 'harassment' | 'fake_review' | 'prohibited_item' | 'misleading' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';
  reporterId: string;
  targetId: string;
  createdAt: string;
};

export type PriceAlert = {
  id: string;
  productId: string;
  userId: string;
  targetPrice: number;
  alertType: 'price_drop' | 'price_increase' | 'back_in_stock';
  isActive: boolean;
  notificationMethod: 'email' | 'push' | 'both';
  createdAt: string;
  triggeredAt?: string;
};

export type Conversation = {
  id: string;
  participants: string[];
  type: 'direct' | 'group' | 'support' | 'system';
  title?: string;
  lastMessage?: Message;
  lastMessageAt?: string;
  unreadCount: number;
  productId?: string;
  orderId?: string;
  isArchived: boolean;
  isMuted: boolean;
};

export type EnhancedMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'product' | 'order' | 'system';
  content: string;
  attachments?: MessageAttachment[];
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string;
  reactions?: MessageReaction[];
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export type MessageAttachment = {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
};

export type MessageReaction = {
  userId: string;
  emoji: string;
  reactedAt: string;
};

export type ExclusiveDeal = {
  id: string;
  title: string;
  description: string;
  dealType: 'discount' | 'cashback' | 'free_shipping' | 'bundle';
  discountPercentage?: number;
  requiredTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  productIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
};

export type UserWallet = {
  userId: string;
  balance: number;
  currency: string;
  escrowBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalSpent: number;
  lastTransaction?: string;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  referenceId?: string;
  createdAt: string;
};

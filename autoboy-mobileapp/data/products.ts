
import { Product, Review, CartItem, Address, Order, Message } from '../types';

export const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

export const products: Product[] = [
  {
    id: '1',
    title: 'Wireless Headphones',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1518443895914-6f27e3ed8e32?q=80&w=600&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop',
    image3: 'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?q=80&w=600&auto=format&fit=crop',
    category: 'Electronics',
    condition: 'New',
    description: 'Experience premium sound with noise cancellation and long battery life.',
    sellerId: 's1',
    location: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: '2',
    title: 'Vintage Camera',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=600&auto=format&fit=crop',
    image3: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
    category: 'Electronics',
    condition: 'Used',
    description: 'Classic 35mm camera in great condition. Perfect for film enthusiasts.',
    sellerId: 's2',
    location: { latitude: 34.0522, longitude: -118.2437 },
  },
  {
    id: '3',
    title: 'Sneakers',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1552902865-2bd393a9e5ad?q=80&w=600&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    image3: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    category: 'Fashion',
    condition: 'New',
    description: 'Comfortable everyday sneakers with breathable material.',
    sellerId: 's3',
    location: { latitude: 40.7128, longitude: -74.006 },
  },
  {
    id: '4',
    title: 'Coffee Maker',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1504627298434-2119d6928e6c?q=80&w=600&auto=format&fit=crop',
    image3: 'https://images.unsplash.com/photo-1485808191679-5f86510681b1?q=80&w=600&auto=format&fit=crop',
    category: 'Home',
    condition: 'New',
    description: 'Brew fresh coffee at home with programmable settings.',
    sellerId: 's4',
    location: { latitude: 47.6062, longitude: -122.3321 },
  },
  {
    id: '5',
    title: 'Yoga Mat',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1575052814074-37ddca7abfee?q=80&w=600&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1599055734865-f15445e2b06b?q=80&w=600&auto=format&fit=crop',
    image3: 'https://images.unsplash.com/photo-1562077774-3f476f7c3323?q=80&w=600&auto=format&fit=crop',
    category: 'Sports',
    condition: 'New',
    description: 'Non-slip yoga mat perfect for home workouts and yoga.',
    sellerId: 's5',
    location: { latitude: 51.5074, longitude: -0.1278 },
  },
  {
    id: '6',
    title: 'Makeup Kit',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=600&auto=format&fit=crop',
    image3: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop',
    category: 'Beauty',
    condition: 'New',
    description: 'All-in-one makeup kit for a complete look.',
    sellerId: 's6',
    location: { latitude: 41.8781, longitude: -87.6298 },
  },
];

export const cartItems: CartItem[] = [
  { id: '1', title: 'Wireless Headphones', price: 59.99, qty: 1 },
  { id: '3', title: 'Sneakers', price: 79.99, qty: 1 },
];

export const savedForLater: CartItem[] = [
  { id: '2', title: 'Vintage Camera', price: 129.99, qty: 1 },
];

export const wishlistIds: string[] = ['2', '5'];

export const mockReviews: Review[] = [
  { id: 'r1', productId: '1', author: 'Alex', rating: 5, text: 'Great sound quality and comfy!', date: '2024-11-03' },
  { id: 'r2', productId: '2', author: 'Jamie', rating: 4, text: 'Love the retro vibe!', date: '2024-12-01' },
  { id: 'r3', productId: '1', author: 'Sam', rating: 4, text: 'Battery lasts long, recommended.', date: '2025-01-05' },
];

export const mockConversations = [
  { id: 's1', title: 'Seller of Wireless Headphones', lastMessage: 'Sure, available!' },
  { id: 's2', title: 'Vintage Camera Seller', lastMessage: 'Price negotiable.' },
];

export const mockMessages: Record<string, Message[]> = {
  s1: [
    { sender: 'me', text: 'Hi, is this still available?' },
    { sender: 'them', text: 'Yes, it is!' },
  ],
  s2: [
    { sender: 'me', text: 'Can you do ₦110?' },
    { sender: 'them', text: 'I can do ₦120.' },
  ],
};

export const mockOrders = [
  { id: '1001', date: '2024-10-02', total: 182.50, status: 'Delivered', tracking: 'TRACK123' },
  { id: '1002', date: '2024-11-15', total: 79.99, status: 'Shipped', tracking: 'TRACK456' },
];

export const savedAddresses: Address[] = [
  { id: 'a1', name: 'Home', street: '123 Market Street', city: 'Springfield', state: 'CA', zip: '12345' },
  { id: 'a2', name: 'Work', street: '456 Office Blvd', city: 'Springfield', state: 'CA', zip: '12346' },
];

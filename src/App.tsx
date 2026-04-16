import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, doc, getDoc, setDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './lib/firebase';
import { Product, UserProfile, CartItem } from './types';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import HelpCenter from './components/HelpCenter';
import { Toaster, toast } from 'sonner';
import { motion } from 'motion/react';
import { semanticSearch } from './services/gemini';
import { Github, Twitter, Linkedin, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || '',
            role: 'customer',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productData);
      setFilteredProducts(productData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    try {
      const relevantIds = await semanticSearch(query, products);
      if (relevantIds.length > 0) {
        const sorted = [...products].sort((a, b) => {
          const indexA = relevantIds.indexOf(a.id);
          const indexB = relevantIds.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setFilteredProducts(sorted);
      } else {
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
    } catch (error) {
      console.error("AI Search failed", error);
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images[0]
          })),
          customerEmail: user.email
        })
      });

      const { id } = await response.json();
      // In a real app, you'd redirect to Stripe here
      // window.location.href = `https://checkout.stripe.com/pay/${id}`;
      toast.info('Checkout session created! (Redirecting to Stripe would happen here)');
      
      // Mock successful order creation
      await addDoc(collection(db, 'orders'), {
        customerId: user.uid,
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: 'pending',
        createdAt: serverTimestamp(),
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      setCart([]);
      setIsCartOpen(false);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Checkout failed');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0c0e14]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#6366f1] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-[#6366f1] tracking-widest uppercase animate-pulse">Nexus</span>
          </div>
        </div>
        <p className="mt-6 text-gray-500 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">Initializing Platform</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" theme="dark" />
      <Navbar 
        user={user} 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        onSearch={handleSearch}
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-8 p-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#6366f1] mb-4 ml-4">Marketplace</h3>
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-bold transition-all">
                All Products
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 text-sm font-medium transition-all">
                New Arrivals
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 text-sm font-medium transition-all">
                Flash Sales
              </button>
            </nav>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#6366f1] mb-4 ml-4">Categories</h3>
            <nav className="space-y-1">
              {['Electronics', 'Home & Office', 'Fashion', 'Software'].map(cat => (
                <button key={cat} className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/5 text-gray-400 text-sm font-medium transition-all">
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4 glass rounded-2xl border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="ai-badge">AI INSIGHTS</div>
            </div>
            <p className="text-[10px] text-gray-400 italic leading-relaxed">
              "Demand for workspace audio is up 14% this week. Trending: ProStream X1."
            </p>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex flex-col gap-8">
          {/* Hero Section */}
          <section className="relative h-64 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/30 via-[#a855f7]/20 to-transparent z-10" />
            <img 
              src="https://picsum.photos/seed/tech/1200/400" 
              alt="NexusMarket Banner" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-12">
              <div className="ai-badge w-fit mb-4">GEMINI POWERED</div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                Welcome back{user ? `, ${user.displayName.split(' ')[0]}` : ''}.
              </h1>
              <p className="text-lg text-gray-300 max-w-md leading-snug">
                Based on your interest in <strong className="text-white">audio engineering</strong>, we found new listings for you.
              </p>
            </div>
          </section>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-3xl border-white/5">
                <p className="text-xl text-gray-400">No products found matching your search.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Panel */}
        <aside className="hidden xl:flex flex-col gap-6">
          <div className="glass p-6 rounded-[24px] border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">Platform Health</h3>
              <span className="flex h-2 w-2 rounded-full bg-[#2dd4bf] animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Active Vendors</span>
                <span className="text-sm font-bold text-white">1,248</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Daily Volume</span>
                <span className="text-sm font-bold text-white">$42.5k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Latency</span>
                <span className="text-sm font-bold text-[#2dd4bf]">14ms</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border-white/5 flex-1">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 mb-6">Top Vendors</h3>
            <div className="space-y-6">
              {[
                { name: 'AudioFlow Inc.', initial: 'AF', stats: '4.9 ★ (2k+ Sales)', color: 'bg-[#6366f1]' },
                { name: 'TechCore Solutions', initial: 'TC', stats: '4.8 ★ (1.5k Sales)', color: 'bg-[#f43f5e]' },
                { name: 'KeyHaven', initial: 'KH', stats: '5.0 ★ (800 Sales)', color: 'bg-[#eab308]' }
              ].map(vendor => (
                <div key={vendor.name} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 rounded-full ${vendor.color} flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {vendor.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#6366f1] transition-colors">{vendor.name}</p>
                    <p className="text-[10px] text-gray-500">{vendor.stats}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <HelpCenter />

      <footer className="mt-20 border-t border-white/10 bg-[#0c0e14]/50 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tighter text-white">Nexus<span className="text-[#6366f1]">Market</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              The world's first AI-native multi-vendor marketplace. Experience the future of commerce today.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#6366f1] hover:border-[#6366f1] transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Marketplace</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">All Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Featured Vendors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Recommendations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3"><Mail size={16} className="text-[#6366f1]" /> support@nexusmarket.ai</li>
              <li className="flex items-center gap-3"><Phone size={16} className="text-[#6366f1]" /> +1 (555) 000-0000</li>
              <li className="flex items-center gap-3"><MapPin size={16} className="text-[#6366f1]" /> Silicon Valley, CA</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-8 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            © 2026 NexusMarket AI • Built with Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, LogOut, LayoutDashboard, X, MessageSquare } from 'lucide-react';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  cartCount: number;
  onCartClick: () => void;
  onSearch: (query: string) => void;
}

export default function Navbar({ user, cartCount, onCartClick, onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass backdrop-blur-xl px-4 md:px-8 h-[72px] flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.location.href = '/'}>
        <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-white">Nexus<span className="text-[#6366f1]">Market</span></span>
      </div>

      {/* Desktop Search */}
      <div className="flex-1 max-w-xl mx-8 hidden lg:block">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="ai-gradient-text font-bold text-xs mr-2">AI</span>
          </div>
          <input
            type="text"
            placeholder='Ask anything... "Find me professional gear"'
            className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-12 pr-10 text-sm text-white focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="hidden lg:block bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all">
          Become a Seller
        </button>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="group relative flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Account</span>
                <span className="text-sm font-semibold">{user.displayName.split(' ')[0]}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#2dd4bf] border-2 border-white/10 flex items-center justify-center font-bold text-white shadow-lg">
                {user.displayName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute top-full right-0 mt-2 w-56 glass backdrop-blur-2xl rounded-xl shadow-2xl hidden group-hover:block z-50 overflow-hidden border border-white/10">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <p className="font-bold text-white">{user.displayName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <ul className="py-2">
                  {user.role === 'vendor' && (
                    <li className="px-4 py-2 hover:bg-white/10 flex items-center gap-3 text-sm text-gray-200" onClick={() => window.location.hash = 'vendor'}>
                      <LayoutDashboard size={16} className="text-[#6366f1]" /> Vendor Dashboard
                    </li>
                  )}
                  {user.role === 'admin' && (
                    <li className="px-4 py-2 hover:bg-white/10 flex items-center gap-3 text-sm text-gray-200" onClick={() => window.location.hash = 'admin'}>
                      <LayoutDashboard size={16} className="text-[#6366f1]" /> Admin Panel
                    </li>
                  )}
                  <li className="px-4 py-2 hover:bg-white/10 flex items-center gap-3 text-sm text-red-400" onClick={logout}>
                    <LogOut size={16} /> Sign Out
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              <User size={18} /> Sign In
            </button>
          )}
        </div>

        {/* Cart Icon */}
        <div className="relative flex items-center cursor-pointer group" onClick={onCartClick}>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
            <ShoppingCart size={22} className="text-white" />
          </div>
          <span className="absolute -top-1 -right-1 bg-[#6366f1] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0c0e14]">
            {cartCount}
          </span>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] z-40 bg-[#0c0e14]/90 backdrop-blur-xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 flex flex-col gap-6 h-full">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search NexusMarket..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white outline-none focus:border-[#6366f1]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </button>
            </form>

            <div className="grid grid-cols-1 gap-2">
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-200 font-medium flex items-center gap-3">
                <LayoutDashboard size={20} className="text-[#6366f1]" /> Categories
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-200 font-medium flex items-center gap-3">
                <ShoppingCart size={20} className="text-[#6366f1]" /> Deals
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-gray-200 font-medium flex items-center gap-3">
                <MessageSquare size={20} className="text-[#6366f1]" /> Help Center
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-white/10">
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-4">
                    <div className="w-12 h-12 rounded-full bg-[#2dd4bf] flex items-center justify-center font-bold text-white">
                      {user.displayName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.displayName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="w-full py-4 rounded-xl bg-[#6366f1] text-white font-bold shadow-lg shadow-indigo-500/20"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
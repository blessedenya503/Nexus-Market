import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, isOpen, onClose, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass backdrop-blur-3xl z-[70] shadow-2xl flex flex-col border-l border-white/10"
          >
            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-3 text-white">
                <ShoppingBag className="text-[#6366f1]" /> Your Cart
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-[#6366f1] hover:underline text-sm">Continue Shopping</button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-4 hover:bg-white/10 transition-all">
                    <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center p-2">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-100 line-clamp-1">{item.name}</h3>
                      <p className="text-[#6366f1] font-black mt-1">${item.price.toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center bg-black/20 rounded-lg border border-white/5">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1.5 hover:text-[#6366f1] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1.5 hover:text-[#6366f1] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-[10px] uppercase tracking-widest font-bold text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 bg-white/5 border-t border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">Subtotal ({items.length} items)</span>
                  <span className="text-white text-2xl font-black tracking-tighter">${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                  Checkout Now
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

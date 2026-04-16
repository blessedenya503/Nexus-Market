import React from 'react';
import { Star, Plus } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="glass backdrop-blur-md p-4 flex flex-col h-full rounded-2xl hover:bg-white/10 transition-all cursor-pointer group border-white/5"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
        <img 
          src={product.images[0] || `https://picsum.photos/seed/${product.id}/400/400`} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2">
          <span className="text-[10px] bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-gray-300 border border-white/10">
            {product.category}
          </span>
        </div>
      </div>
      
      <h3 className="text-sm font-semibold line-clamp-2 mb-2 text-gray-100 group-hover:text-[#6366f1] transition-colors leading-tight">
        {product.name}
      </h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/5">
          Verified
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-baseline">
          <span className="text-[#6366f1] font-black text-xl">${product.price.toFixed(2)}</span>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="p-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-90"
        >
          <Plus size={18} />
        </button>
      </div>
    </motion.div>
  );
}

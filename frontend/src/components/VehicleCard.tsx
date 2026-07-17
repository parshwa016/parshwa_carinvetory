import React, { useState } from 'react';
import { ShoppingCart, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (id: string) => Promise<void>;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onRestock?: (id: string, qty: number) => Promise<void>;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isAdmin,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
}) => {
  const [purchasing, setPurchasing] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [restockQty, setRestockQty] = useState('');

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await onPurchase(vehicle.id);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockQty || parseInt(restockQty) <= 0) return;
    setRestocking(true);
    try {
      if (onRestock) {
        await onRestock(vehicle.id, parseInt(restockQty));
        setRestockQty('');
      }
    } finally {
      setRestocking(false);
    }
  };

  // Get dynamic gradient & icon theme based on vehicle category
  const getTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case 'suv':
        return {
          bg: 'from-emerald-500 to-teal-600',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        };
      case 'sedan':
        return {
          bg: 'from-blue-500 to-indigo-600',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
        };
      case 'coupe':
      case 'convertible':
        return {
          bg: 'from-rose-500 to-orange-600',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
        };
      case 'electric':
        return {
          bg: 'from-cyan-500 to-blue-600',
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
        };
      default:
        return {
          bg: 'from-slate-500 to-slate-700',
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-100',
        };
    }
  };

  const theme = getTheme(vehicle.category);
  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group">
      {/* Visual Car Graphic representation with beautiful gradients */}
      <div className={`h-40 bg-gradient-to-br ${theme.bg} relative flex items-center justify-center p-6 text-white overflow-hidden`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Sleek SVG Car Icon representing drive/speed */}
        <svg
          className="w-32 h-16 transform group-hover:scale-105 transition-transform duration-500 ease-out"
          viewBox="0 0 100 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Wheel Arch & Body */}
          <path d="M10,35 L20,35 C20,30 30,30 30,35 L70,35 C70,30 80,30 80,35 L90,35 C92,35 94,33 94,31 L90,20 C89,17 86,15 82,15 L65,15 L50,8 L25,8 L15,18 L8,24 C6,25 5,27 5,29 L5,31 C5,33 7,35 10,35 Z" fill="rgba(255,255,255,0.1)"/>
          {/* Wheels */}
          <circle cx="25" cy="35" r="5" fill="currentColor"/>
          <circle cx="25" cy="35" r="2" fill="none" stroke="black" strokeWidth="0.5"/>
          <circle cx="75" cy="35" r="5" fill="currentColor"/>
          <circle cx="75" cy="35" r="2" fill="none" stroke="black" strokeWidth="0.5"/>
          {/* Windows */}
          <path d="M28,11 L48,11 L58,20 L20,20 Z" fill="rgba(255,255,255,0.25)" stroke="currentColor" strokeWidth="1"/>
          <path d="M50,11 L64,11 L74,20 L58,20 Z" fill="rgba(255,255,255,0.25)" stroke="currentColor" strokeWidth="1"/>
        </svg>

        <span className={`absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full border bg-white/95 text-slate-800 border-white/20 shadow-sm uppercase tracking-wider`}>
          {vehicle.category}
        </span>
      </div>

      {/* Car Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-extrabold text-xl text-slate-900 group-hover:text-blue-600 transition">
              {vehicle.make} <span className="font-medium text-slate-600">{vehicle.model}</span>
            </h3>
            <span className="font-black text-lg text-slate-900">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-3 mb-4">
            {isOutOfStock ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-100">
                Out of Stock
              </span>
            ) : vehicle.quantity <= 2 ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100">
                Only {vehicle.quantity} left
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {vehicle.quantity} in stock
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={isOutOfStock || purchasing}
            className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.98]'
            }`}
          >
            {purchasing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Purchase'}</span>
              </>
            )}
          </button>

          {/* Admin Tools Panel */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit && onEdit(vehicle)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-semibold transition"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete && onDelete(vehicle.id)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-semibold transition"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Restock Form */}
              <form onSubmit={handleRestockSubmit} className="flex items-center space-x-1">
                <input
                  type="number"
                  placeholder="Restock qty"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  required
                />
                <button
                  type="submit"
                  disabled={restocking}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                >
                  {restocking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  <span>Restock</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VehicleCard;

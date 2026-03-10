import React from "react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils";

const CartBanner = ({ onOpenDrawer }) => {
  const { cartCount, cartTotal } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto flex justify-center pointer-events-auto mt-8">
        <button
          onClick={onOpenDrawer}
          className="w-full flex justify-between items-center py-4 px-6 bg-black text-white rounded-2xl shadow-xl hover:bg-gray-900 active:scale-95 transition-all animate-fade-in-up"
        >
          <div className="flex items-center gap-3">
            <span className="bg-white text-black w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
              {cartCount}
            </span>
            <span className="text-lg font-semibold tracking-tight">View items</span>
          </div>
          <span className="text-lg font-bold">
            {formatCurrency(cartTotal)}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CartBanner;

import React from "react";
import { useCart } from "../context/CartContext";

// Accept the prop here
const CartBanner = ({ onOpenDrawer }) => {
  const { cartCount, cartTotal } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-50">
      <button
        onClick={onOpenDrawer} // Trigger the prop when clicked
        className="w-full max-w-md bg-slate-900 text-white flex justify-between items-center py-4 px-6 rounded-2xl shadow-2xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95"
      >
        <div className="flex items-center gap-3">
          <span className="bg-white text-slate-900 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold">
            {cartCount}
          </span>
          <span className="text-lg font-semibold">View order</span>
        </div>

        <span className="text-lg font-bold">${cartTotal.toFixed(2)}</span>
      </button>
    </div>
  );
};

export default CartBanner;

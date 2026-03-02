import React from "react";
import { useCart } from "../context/CartContext";

const CheckoutDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, addToCart, removeFromCart, clearCart } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Dark Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Order</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-3xl"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto mb-6 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{item.name}</h4>
                <p className="text-slate-500 text-sm">
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600"
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => {
              alert("Order Placed! (We will connect this to the backend next)");
              clearCart();
              onClose();
            }}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDrawer;

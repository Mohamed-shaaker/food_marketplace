import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom"; // Add this

const CheckoutDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, addToCart, removeFromCart, clearCart } =
    useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // Add this
  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Retrieve the token from localStorage
      const token = localStorage.getItem("token");

      const payload = {
        restaurant_id: cartItems[0].restaurant_id,
        items: cartItems.map((item) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
      };

      // 2. Send to backend with the Authorization Header
      const response = await axios.post("/api/orders/", payload, {
        headers: {
          Authorization: `Bearer ${token}`, // This fixes the 403 error
        },
      });

      if (response.status === 201) {
        const orderId = response.data.id;
        clearCart();
        onClose();
        // Objective: Order Confirmation via Redirect
        navigate(`/order-status/${orderId}`);
      }
    } catch (error) {
      console.error("Order error:", error);
      // Handle 403 specifically to guide the user
      if (error.response?.status === 403) {
        alert("Session expired or unauthorized. Please log in again.");
      } else {
        const errorMsg =
          error.response?.data?.detail ||
          "Failed to place order. Please try again.";
        alert(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
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
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  -
                </button>
                <span className="font-bold w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                  disabled={isSubmitting}
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
            onClick={handlePlaceOrder}
            disabled={isSubmitting || cartItems.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-black"
            }`}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDrawer;

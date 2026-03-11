import React, { useState } from "react";
import { X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils";

const CheckoutDrawer = ({ isOpen, onClose, restaurantId }) => {
  const { cartItems, clearCart, cartTotal, getCartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Re-evaluate on every render so it stays fresh after login
  const isGuest = !localStorage.getItem("token");

  const handlePlaceOrder = async () => {
    // Guest redirect — preserve the current page so we can return after login
    if (isGuest) {
      onClose();
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (!restaurantId) {
      setError("Could not identify the restaurant. Please go back and try again.");
      return;
    }

    setIsPlacingOrder(true);
    setError("");

    const orderPayload = {
      restaurant_id: restaurantId,
      items: cartItems.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await api.post("/orders/", orderPayload);
      clearCart();
      onClose();
      navigate("/my-orders");
    } catch (err) {
      // Full server response logged for debugging
      console.error("Order placement failed:");
      console.error("Status:", err.response?.status);
      console.error("Server detail:", err.response?.data);
      setError(
        err.response?.data?.detail ?? "Failed to place order. Please try again."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Your Order</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || cartItems.length === 0}
            className="w-full bg-black text-white font-bold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {isGuest
              ? "Login to Order"
              : isPlacingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDrawer;

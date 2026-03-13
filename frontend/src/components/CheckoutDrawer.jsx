import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils";
import {
  KAMPALA_AREAS,
  formatPhoneNumber,
  isValidPhoneNumber,
  validateCheckoutForm,
} from "../utils/checkout";
import OrderConfirmation from "./OrderConfirmation";

const CheckoutDrawer = ({ isOpen, onClose, restaurantId, restaurantName }) => {
  const { cartItems, clearCart, cartTotal, getCartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [restaurantPhone, setRestaurantPhone] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    neighborhood: "",
    landmarks: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Re-evaluate on every render so it stays fresh after login
  const isGuest = !localStorage.getItem("token");

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Only allow digits and +
    const cleaned = input.replace(/[^\d+]/g, "");
    setFormData((prev) => ({
      ...prev,
      phone: cleaned,
    }));
    // Clear error as user types
    if (formErrors.phone) {
      setFormErrors((prev) => {
        const { phone, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error as user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

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

    // Validate form
    const validation = validateCheckoutForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
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
      phone_number: formatPhoneNumber(formData.phone),
      delivery_address: formData.address,
      delivery_area: formData.neighborhood,
      special_instructions: formData.landmarks || "",
    };

    try {
      const response = await api.post("/orders/", orderPayload);
      setConfirmedOrder(response.data);
      
      // Fetch restaurant phone if available
      try {
        const restaurantRes = await api.get(`/restaurants/${restaurantId}/`);
        setRestaurantPhone(restaurantRes.data.phone_number || "");
      } catch {
        setRestaurantPhone("");
      }

      clearCart();
      setShowConfirmation(true);
      onClose();
    } catch (err) {
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
    <>
      {/* Main Checkout Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Cart Items */}
            <div className="p-4 space-y-4 border-b">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Your cart is empty.
                </p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Delivery Form */}
            {cartItems.length > 0 && (
              <div className="p-4 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">
                  Delivery Details
                </h3>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-primary/30 bg-white transition-all">
                    <span className="text-gray-400 text-sm font-medium">+256</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="7XX XXX XXX"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength="20"
                      className="flex-1 outline-none text-sm bg-transparent"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    We'll send order updates here
                  </p>
                </div>

                {/* Neighborhood Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Neighborhood
                  </label>
                  <select
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-sm"
                  >
                    <option value="">Select your neighborhood...</option>
                    {KAMPALA_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  {formErrors.neighborhood && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.neighborhood}
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House number, street name, building name..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-sm resize-none"
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Landmarks / Special Instructions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Landmarks (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmarks"
                    value={formData.landmarks}
                    onChange={handleInputChange}
                    placeholder="e.g., Near the Total Station"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Help the driver find you easier
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Order Total & CTA */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0}
                className="w-full bg-black text-white font-bold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 active:scale-95 transition-all"
              >
                {isGuest
                  ? "Login to Order"
                  : isPlacingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Confirmation Bottom Sheet */}
      <OrderConfirmation
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setFormData({
            phone: "",
            address: "",
            neighborhood: "",
            landmarks: "",
          });
          navigate("/my-orders");
        }}
        order={confirmedOrder}
        restaurantName={restaurantName}
        restaurantPhone={restaurantPhone}
      />
    </>
  );
};

export default CheckoutDrawer;

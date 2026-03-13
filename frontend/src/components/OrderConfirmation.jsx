import React, { useEffect, useState } from "react";
import { Check, Phone, Copy, X } from "lucide-react";

/**
 * Custom Bottom Sheet Component
 * Slides up from bottom with smooth animations
 */
const BottomSheet = ({ isOpen, onClose, children, snapHeight = 0.6 }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxHeight: `${snapHeight * 100}vh`,
        }}
        onTransitionEnd={() => {
          if (!isOpen) setIsVisible(false);
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(60vh - 40px)" }}>
          {children}
        </div>
      </div>
    </>
  );
};

/**
 * Order Confirmation Screen
 */
const OrderConfirmation = ({
  isOpen,
  onClose,
  order,
  restaurantName,
  restaurantPhone,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCallRestaurant = () => {
    if (restaurantPhone) {
      window.location.href = `tel:${restaurantPhone}`;
    }
  };

  useEffect(() => {
    // Auto-close after 10 seconds if user doesn't interact
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} snapHeight={0.7}>
      <div className="w-full bg-white p-6 flex flex-col items-center justify-center pb-8">
        {/* Success Checkmark Animation */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-green-50 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-500 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Order Confirmed!
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Your order has been placed successfully
        </p>

        {/* Order Details Card */}
        <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            {/* Order ID */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Order ID
              </p>
              <div className="flex items-center gap-2 justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="font-mono text-sm font-bold text-gray-900">
                  {order?.id ? order.id.substring(0, 8).toUpperCase() : "N/A"}
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className={`p-2 rounded-lg transition-all ${
                    copied
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Copy Order ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Restaurant Name */}
            {restaurantName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                  Restaurant
                </p>
                <p className="font-semibold text-gray-900">{restaurantName}</p>
              </div>
            )}

            {/* Estimated Time */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                Estimated Delivery
              </p>
              <p className="font-semibold text-gray-900">15–30 minutes</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 mb-4">
          {/* Call Restaurant Button */}
          <button
            onClick={handleCallRestaurant}
            disabled={!restaurantPhone}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 active:scale-95 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Phone className="w-4 h-4" />
            Call Restaurant
          </button>

          {/* Continue Shopping Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            Continue Shopping
          </button>
        </div>

        {/* Info Message */}
        <p className="text-xs text-gray-400 text-center">
          You'll receive updates via SMS
        </p>
      </div>
    </BottomSheet>
  );
};

export default OrderConfirmation;

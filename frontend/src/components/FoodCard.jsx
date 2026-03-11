import React from "react";
import { formatCurrency } from "../utils";

const FoodCard = ({ item, onAddToCart }) => {
  const handleImageError = (e) => {
    e.target.onerror = null; // prevent infinite loops
    e.target.src =
      "https://images.unsplash.com/photo-1476224484781-a35a172aa55c?w=400";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100/50 overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-4xl text-gray-400">🍽️</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(item.price)}
          </span>
          <button
            onClick={() => onAddToCart(item)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;

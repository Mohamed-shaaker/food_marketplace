import React from "react";

/**
 * Menu item skeleton loader - shows 2-col grid of shimmer cards
 */
export const MenuItemSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mt-5">
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex justify-between gap-4 animate-pulse"
        >
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded-full w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded-full w-32 mb-1" />
            <div className="h-3 bg-gray-100 rounded-full w-48 mb-3" />
            <div className="h-5 bg-gray-300 rounded-full w-24 mt-3" />
          </div>
          <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-100 rounded-2xl flex-shrink-0" />
        </div>
      ))}
  </div>
);

/**
 * Restaurant card skeleton - shows grid of shimmer cards
 */
export const RestaurantCardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
    {Array(8)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="w-full aspect-video bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded-full w-32" />
            <div className="h-3 bg-gray-100 rounded-full w-48" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-100 rounded-full w-12" />
              <div className="h-6 bg-gray-100 rounded-full w-12" />
            </div>
          </div>
        </div>
      ))}
  </div>
);

/**
 * Checkout form skeleton
 */
export const CheckoutFormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-10 bg-gray-100 rounded-lg" />
        </div>
      ))}
  </div>
);

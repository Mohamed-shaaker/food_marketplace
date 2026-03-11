import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  Clock,
  Pizza,
  Hamburger,
  Salad,
  Utensils,
} from "lucide-react";
import api from "../api/axios";

// ─── Helper: Map cuisine names to icons ──────────────────────────────────────

const CUISINE_ICONS = {
  pizza: Pizza,
  burger: Hamburger,
  burgers: Hamburger,
  salad: Salad,
  salads: Salad,
  general: Utensils,
};

const getCuisineIcon = (cuisineName) => {
  const key = cuisineName?.toLowerCase().trim();
  return (
    CUISINE_ICONS[key] || CUISINE_ICONS.general
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-400">Loading restaurants…</p>
    </div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Utensils className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-red-500">{message}</p>
      <p className="text-xs text-gray-400 mt-3">
        Please check your connection or try again later.
      </p>
    </div>
  </div>
);

const CuisineScroller = ({ cuisines, selectedCuisine, onSelectCuisine }) => (
  <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2">
    {/* All button */}
    <button
      onClick={() => onSelectCuisine("All")}
      className={`flex flex-col items-center gap-2 py-2 px-1 rounded-lg transition-all duration-200 flex-shrink-0 ${
        selectedCuisine === "All"
          ? "text-primary scale-110"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          selectedCuisine === "All"
            ? "bg-blue-50 border-2 border-primary"
            : "bg-gray-100 border-2 border-transparent"
        }`}
      >
        <Utensils className="w-5 h-5" strokeWidth={2} />
      </div>
      <span className="text-xs font-semibold text-center whitespace-nowrap">
        All
      </span>
    </button>

    {/* Cuisine buttons */}
    {cuisines.map((cuisine) => {
      const IconComponent = getCuisineIcon(cuisine);
      const isSelected = selectedCuisine === cuisine;

      return (
        <button
          key={cuisine}
          onClick={() => onSelectCuisine(cuisine)}
          className={`flex flex-col items-center gap-2 py-2 px-1 rounded-lg transition-all duration-200 flex-shrink-0 ${
            isSelected
              ? "text-primary scale-110"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isSelected
                ? "bg-blue-50 border-2 border-primary"
                : "bg-gray-100 border-2 border-transparent"
            }`}
          >
            <IconComponent className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="text-xs font-semibold text-center line-clamp-1 max-w-[60px]">
            {cuisine}
          </span>
        </button>
      );
    })}
  </div>
);

const RestaurantCard = ({ restaurant }) => {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src =
      "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?w=600&h=400&auto=compress&cs=tinysrgb";
  };

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
    >
      {/* Image — 16:9 aspect ratio */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-gray-50">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Overlay badges — positioned top-right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
          {/* Rating badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            <span className="text-xs font-bold text-gray-900">
              {restaurant.rating || "New"}
            </span>
          </div>

          {/* Delivery time badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">15–30</span>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
          {restaurant.name}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
          {restaurant.description || "Delicious food delivered fresh."}
        </p>

        {/* Category tags (first 2 cuisines) */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {restaurant.menu_items?.slice(0, 2).map((item, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-1 rounded-full bg-gray-50 text-gray-600 font-medium"
            >
              {item.category}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────

function Restaurants() {
  // ── Original state & logic (preserved exactly) ──────────────────────────────
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/restaurants/");
        setRestaurants(response.data);
        setError(null);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to load restaurants. The kitchen might be closed!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const allCuisines = useMemo(() => {
    const cuisines = new Set();
    restaurants.forEach((r) => {
      (r.menu_items || []).forEach((item) => cuisines.add(item.category));
    });
    return Array.from(cuisines).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((restaurant) => {
        if (selectedCuisine === "All") return true;
        const restaurantCuisines = new Set(
          (restaurant.menu_items || []).map((item) => item.category),
        );
        return restaurantCuisines.has(selectedCuisine);
      })
      .filter((restaurant) => {
        return restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [restaurants, searchTerm, selectedCuisine]);

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-32">

      {/* ══ Hero Section ══════════════════════════════════════════════════════ */}
      <div className="relative h-64 md:h-80 bg-slate-800 overflow-hidden">
        {/* Hero background image with overlay */}
        <img
          src="https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?w=1200&h=600&auto=compress&cs=tinysrgb"
          alt="Food"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/75" />

        {/* Text content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-sm">
            Kampala's Best Flavors
          </h1>
          <p className="text-sm md:text-base text-white/80 mb-6 drop-shadow-sm max-w-lg">
            Discover delicious meals from top restaurants, delivered fresh to your
            door
          </p>

          {/* Search bar integrated in hero */}
          <div className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search restaurants…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white rounded-full pl-12 pr-4 py-3 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Main content ══════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">

        {/* ── Cuisine scroller ── */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
            Browse by Cuisine
          </h2>
          <CuisineScroller
            cuisines={allCuisines}
            selectedCuisine={selectedCuisine}
            onSelectCuisine={setSelectedCuisine}
          />
        </div>

        {/* ── Restaurant grid ── */}
        {filteredRestaurants.length > 0 ? (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {searchTerm
                  ? `Results for "${searchTerm}"`
                  : selectedCuisine === "All"
                    ? "All Restaurants"
                    : `${selectedCuisine} Restaurants`}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {filteredRestaurants.length}{" "}
                {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No restaurants found</h3>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search or filters
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
            {selectedCuisine !== "All" && (
              <button
                onClick={() => setSelectedCuisine("All")}
                className="mt-2 text-sm text-primary font-semibold hover:underline"
              >
                Show all cuisines
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Restaurants;

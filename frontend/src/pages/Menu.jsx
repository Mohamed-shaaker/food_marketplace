import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Star,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils";
import CartBanner from "../components/CartBanner";
import CheckoutDrawer from "../components/CheckoutDrawer";

// ─── Micro-components ─────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-400 tracking-wide">
        Loading menu…
      </p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
    <div className="text-center max-w-xs">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
        <UtensilsCrossed className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Oops!</h2>
      <p className="text-sm text-red-500 mb-6">{message}</p>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Menu = () => {
  // ── All original state & logic preserved ──────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { cartItems, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/restaurants/${id}/`);
        const restaurantData = response.data;
        setRestaurant(restaurantData);
        setMenuItems(restaurantData.menu_items || []);
      } catch (err) {
        setError("Failed to load the menu. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  const categories = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return ["All"];
    const uniqueCategories = [
      ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
    ];
    return ["All", ...uniqueCategories.sort()];
  }, [menuItems]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) setActiveCategory("All");
  }, [categories, activeCategory]);

  const filteredMenuItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== "All") {
      items = items.filter((item) => item.category === activeCategory);
    }
    if (searchTerm) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return items;
  }, [menuItems, activeCategory, searchTerm]);

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find((i) => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onBack={() => navigate(-1)} />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-32">

      {/* ══ Hero Header ══════════════════════════════════════════════════════ */}
      <div className="relative h-56 md:h-72 bg-slate-800 overflow-hidden">
        {/* Background image */}
        {restaurant?.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant?.name}
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}

        {/* Gradient: dark at bottom, subtle at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

        {/* Back button — floating top-left */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Restaurant info — anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2.5 drop-shadow-sm">
            {restaurant?.name || "Restaurant Menu"}
          </h1>

          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rating badge — amber accent */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
              <Star className="w-3 h-3 fill-amber-900 stroke-amber-900" />
              {restaurant?.rating || "New"}
            </span>

            {/* Delivery time */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
              <Clock className="w-3 h-3" />
              15–30 min
            </span>

            {/* Currency */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
              UGX
            </span>
          </div>
        </div>
      </div>

      {/* ══ Sticky: Search + Category Pills ═════════════════════════════════ */}
      <div className="sticky top-16 z-20 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {/* Search bar */}
        <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search menu items…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Animated category pills */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="flex overflow-x-auto hide-scrollbar gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-sm scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Menu Items Grid ══════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-5 pb-8">
        {filteredMenuItems.length > 0 ? (
          <>
            <h2 className="text-base font-bold text-gray-500 uppercase tracking-widest mb-4">
              {searchTerm
                ? `Results for "${searchTerm}"`
                : activeCategory === "All"
                  ? "All Items"
                  : activeCategory}
            </h2>

            {/* 2-col on desktop, 1-col on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {filteredMenuItems.map((item) => {
                const quantity = getItemQuantity(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between gap-4 p-4"
                  >
                    {/* Left: Text info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {item.category && (
                          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-primary bg-blue-50 px-2 py-0.5 rounded-full mb-1.5">
                            {item.category}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 leading-snug mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {item.description || "Freshly prepared and delicious."}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 mt-3 text-base">
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {/* Right: Image + floating quantity bubble */}
                    <div className="relative flex-shrink-0 self-center" style={{ paddingBottom: "14px" }}>
                      {/* Food image */}
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl text-gray-200">🍽️</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity bubble — floats below image */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-center">
                        {quantity === 0 ? (
                          /* Add button */
                          <button
                            onClick={() => addToCart(item)}
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 active:scale-90 transition-all"
                          >
                            <Plus className="w-4 h-4 text-gray-900" />
                          </button>
                        ) : (
                          /* +/- tracker */
                          <div className="flex items-center gap-0.5 bg-primary text-white rounded-full px-1.5 py-1 shadow-lg">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-75 transition-transform"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="min-w-[18px] text-center font-bold text-xs tabular-nums">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-75 transition-transform"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-900">No items found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or category filter.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Cart Banner + Checkout Drawer (logic unchanged) ── */}
      <CartBanner onOpenDrawer={() => setIsDrawerOpen(true)} />
      <CheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        restaurantId={restaurant?.id}
      />
    </div>
  );
};

export default Menu;

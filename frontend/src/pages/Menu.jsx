import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Minus } from "lucide-react";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils";
import CartBanner from "../components/CartBanner";
import CheckoutDrawer from "../components/CheckoutDrawer";

const Menu = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/restaurants/${id}`);
        const restaurantData = response.data;
        setRestaurant(restaurantData);

        const itemsWithRestaurantId = (restaurantData.menu_items || []).map(
          (item) => ({
            ...item,
            restaurant_id: parseInt(id, 10),
          })
        );
        setMenuItems(itemsWithRestaurantId);
      } catch (err) {
        setError("Failed to load the menu. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id]);

  const getItemQuantity = (itemId) => {
    const cartItem = cart.items.find((i) => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-black underline">Go Back</button>
      </div>
    );

  const categories = ["All", "Popular", "Mains", "Sides", "Drinks", "Desserts"];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-[env(safe-area-inset-bottom)] mb-24">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Restaurant Header */}
        <div className="py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {restaurant?.name || "Restaurant Menu"}
          </h1>
          <div className="flex items-center gap-4 mt-3 text-sm font-medium text-gray-600">
             <span>⭐ {restaurant?.rating || "New"}</span>
             <span>•</span>
             <span>15–30 min</span>
             <span>•</span>
             <span>UGX</span>
          </div>
        </div>

        {/* Uber Eats Horizontal Category Nav */}
        <div className="sticky top-16 z-20 bg-[#FAFAFA] py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-100 mb-6">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeCategory} Items</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {menuItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              
              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between gap-4 group"
                >
                  {/* Left: Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 mb-1 leading-tight">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {item.description || "Freshly prepared and delicious."}
                    </p>
                    <p className="font-medium text-black">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {/* Right: Image & Add Tracker */}
                  <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 flex flex-col items-center justify-center border border-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-3xl text-gray-300">🍽️</span>
                    )}

                    {/* Quantity Selector Overlay */}
                    <div className="absolute inset-x-0 bottom-2 flex justify-center">
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-white text-black shadow-md border border-gray-200 rounded-full h-11 w-11 flex items-center justify-center active:scale-95 transition-transform"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="bg-black text-white shadow-lg rounded-full h-11 flex items-center px-2 scale-110 origin-bottom transition-all duration-200 ease-out">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-full flex items-center justify-center active:scale-75 transition-transform"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm select-none">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-full flex items-center justify-center active:scale-75 transition-transform"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CartBanner onOpenDrawer={() => setIsDrawerOpen(true)} />
      
      <CheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default Menu;

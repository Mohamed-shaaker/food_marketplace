import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { useCart } from "../context/CartContext";
import CartBanner from "../components/CartBanner";
import CheckoutDrawer from "../components/CheckoutDrawer";

const Menu = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/restaurants/${id}`);
        const restaurantData = response.data;
        setRestaurant(restaurantData);

        const itemsWithRestaurantId = (restaurantData.menu_items || []).map((item) => ({
          ...item,
          restaurant_id: parseInt(id, 10),
        }));

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

  if (loading)
    return (
      <div className="p-10 text-center text-xl font-light">
        Loading delicious menu...
      </div>
    );

  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen font-sans pb-32">
      <header className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          {restaurant?.name || "Restaurant Menu"}
        </h1>
        <p className="text-slate-500 font-light">
          Freshly prepared and ready to order.
        </p>
      </header>

      <div className="space-y-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
              <p className="text-orange-600 font-semibold mt-1">
                ${item.price.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => addToCart(item)}
              className="group flex items-center justify-center w-12 h-12 rounded-full border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-900 transition-all"
            >
              <span className="text-2xl text-slate-400 group-hover:text-white transition-colors">
                +
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* 1. We pass the 'setter' function to the banner */}
      <CartBanner onOpenDrawer={() => setIsDrawerOpen(true)} />

      {/* 2. We add the actual Drawer component here */}
      <CheckoutDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default Menu;

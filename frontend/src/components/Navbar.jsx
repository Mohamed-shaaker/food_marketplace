import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("");

  useEffect(() => {
    const loadRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setRole("");
          return;
        }

        const response = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.role);
      } catch {
        setRole("");
      }
    };

    loadRole();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setRole("");
    navigate("/login");
  };

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      {/* Logo / Home Link */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <span className="text-2xl">🍕</span>
        <h1 className="text-xl font-bold text-slate-800">Food Marketplace</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        <Link 
          to="/my-orders" 
          className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
        >
          My Orders
        </Link>

        {role === "restaurant" && (
          <Link
            to="/restaurant-dashboard"
            className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
          >
            Restaurant Dashboard
          </Link>
        )}

        {role === "driver" && (
          <Link
            to="/driver-dashboard"
            className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
          >
            Driver Dashboard
          </Link>
        )}

        {role === "admin" && (
          <Link
            to="/admin"
            className="text-slate-600 hover:text-orange-600 font-medium transition-colors"
          >
            Admin Panel
          </Link>
        )}

        <button 
          onClick={handleLogout}
          className="px-4 py-1.5 border border-slate-300 rounded-full text-slate-600 hover:bg-slate-50 transition-all"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

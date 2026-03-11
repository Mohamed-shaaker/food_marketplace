import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { Menu } from "lucide-react";
import BottomNav from "./BottomNav";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!role;

  useEffect(() => {
    const loadRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setRole("");
          return;
        }
        const response = await api.get("/auth/me");
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
    navigate("/restaurants");
  };

  if (location.pathname === "/login") return null;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-neutral-bg/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto p-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/restaurants")}
            >
              <span className="text-2xl">🍕</span>
              <h1 className="text-xl font-bold text-slate-800">Food Marketplace</h1>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              {isLoggedIn && (
                <Link
                  to="/my-orders"
                  className="text-slate-600 hover:text-primary font-medium transition-colors"
                >
                  My Orders
                </Link>
              )}

              {role === "restaurant" && (
                <Link to="/restaurant-dashboard" className="text-slate-600 hover:text-primary font-medium transition-colors">
                  Restaurant Dashboard
                </Link>
              )}
              {role === "driver" && (
                <Link to="/driver-dashboard" className="text-slate-600 hover:text-primary font-medium transition-colors">
                  Driver Dashboard
                </Link>
              )}
              {role === "admin" && (
                <Link to="/admin" className="text-slate-600 hover:text-primary font-medium transition-colors">
                  Admin Panel
                </Link>
              )}

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 border border-gray-300 rounded-full text-slate-600 hover:bg-primary hover:text-white transition-all"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-1.5 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 p-4 bg-white rounded-lg shadow-lg border">
              <div className="flex flex-col gap-4">
                {isLoggedIn && (
                  <Link
                    to="/my-orders"
                    className="text-slate-600 hover:text-primary font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                )}
                {role === "restaurant" && (
                  <Link to="/restaurant-dashboard" className="text-slate-600 hover:text-primary font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    Restaurant Dashboard
                  </Link>
                )}
                {role === "driver" && (
                  <Link to="/driver-dashboard" className="text-slate-600 hover:text-primary font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    Driver Dashboard
                  </Link>
                )}
                {role === "admin" && (
                  <Link to="/admin" className="text-slate-600 hover:text-primary font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 border border-gray-300 rounded-full text-slate-600 hover:bg-primary hover:text-white transition-all"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                    className="px-4 py-1.5 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <BottomNav isLoggedIn={isLoggedIn} />
    </>
  );
};

export default Navbar;

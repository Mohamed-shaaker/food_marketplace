import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Move the check inside the function body
  if (location.pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login');
  };

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
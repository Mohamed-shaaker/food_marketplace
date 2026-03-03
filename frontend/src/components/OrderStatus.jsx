import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const OrderStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (err) {
        setError("Could not load order details.");
        console.error(err);
      }
    };
    fetchOrderStatus();
  }, [id]);

  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!order)
    return (
      <div className="p-10 text-center text-slate-500">
        Loading your order...
      </div>
    );

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
        ✓
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Order Confirmed!
      </h1>
      <p className="text-slate-500 mb-8">Order ID: #{order.id}</p>

      <div className="bg-slate-50 rounded-2xl p-6 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
          Status
        </p>
        <p className="text-2xl font-black text-slate-800">{order.status}</p>
      </div>

      <button
        onClick={() => navigate("/")}
        className="text-slate-600 font-semibold hover:text-slate-900 transition-colors"
      >
        Back to Restaurants
      </button>
    </div>
  );
};

export default OrderStatus;

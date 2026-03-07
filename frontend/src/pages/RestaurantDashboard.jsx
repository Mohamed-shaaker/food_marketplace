import React, { useEffect, useState } from "react";
import api from "../api/axios";

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      const response = await api.get("/api/restaurant-ops/orders");
      setOrders(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load restaurant orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrder = async (orderId, action) => {
    try {
      await api.post(`/api/restaurant-ops/orders/${orderId}/${action}`, {});
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} order.`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Loading dashboard...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Restaurant Dashboard
      </h1>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600">
          {error}
        </div>
      )}
      {orders.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-50 text-slate-500">
          No PAID/PREPARING orders.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Order #{order.id}
                </p>
                <p className="text-slate-700 font-semibold">
                  Status: {order.status}
                </p>
                <p className="text-slate-500 text-sm">
                  Subtotal: {Number(order.total_amount).toLocaleString()} UGX
                </p>
              </div>
              <div className="flex gap-2">
                {order.status === "PAID" && (
                  <button
                    onClick={() => updateOrder(order.id, "accept")}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Accept
                  </button>
                )}
                {order.status === "PREPARING" && (
                  <button
                    onClick={() => updateOrder(order.id, "ready")}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;

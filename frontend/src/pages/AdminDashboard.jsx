import React, { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load admin stats.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin Revenue Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Gross Sales</p>
          <p className="text-3xl font-black text-slate-900">${stats.gross_sales.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Platform Profit</p>
          <p className="text-3xl font-black text-emerald-700">${stats.platform_profit.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Deliveries</p>
          <p className="text-3xl font-black text-slate-900">{stats.total_deliveries}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Deliveries</h2>
        {stats.recent_deliveries.length === 0 ? (
          <p className="text-slate-500">No delivered orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Restaurant</th>
                  <th className="py-2 pr-4">Platform Cut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_deliveries.map((delivery) => (
                  <tr key={delivery.order_id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">#{delivery.order_id}</td>
                    <td className="py-2 pr-4">{delivery.restaurant_name}</td>
                    <td className="py-2 pr-4 font-semibold text-emerald-700">
                      ${delivery.platform_cut.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

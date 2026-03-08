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
    return (
      <div className="p-8 text-center text-slate-500 font-light">
        Loading admin insights...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6 border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Revenue Dashboard
        </h1>
        <p className="text-slate-500 font-light">
          Real-time platform performance overview.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Gross Sales
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {Number(stats?.gross_sales || 0).toLocaleString()} UGX
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Platform Profit
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {Number(stats?.platform_profit || 0).toLocaleString()} UGX
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Total Deliveries
          </p>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {stats?.total_deliveries || 0}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Recent Deliveries
        </h2>
        {!stats?.recent_deliveries || stats.recent_deliveries.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">
              No delivered orders captured in this period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 pr-4 font-semibold">Order ID</th>
                  <th className="pb-4 pr-4 font-semibold">Restaurant</th>
                  <th className="pb-4 pr-4 font-semibold text-right">
                    Platform Cut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recent_deliveries.map((delivery) => (
                  <tr
                    key={delivery.order_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 pr-4 text-slate-600 font-medium">
                      #{delivery.order_id}
                    </td>
                    <td className="py-4 pr-4 text-slate-900">
                      {delivery.restaurant_name}
                    </td>
                    <td className="py-4 pr-4 text-right font-bold text-emerald-600">
                      {Number(delivery.platform_cut || 0).toLocaleString()} UGX
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

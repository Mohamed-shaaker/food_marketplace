import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const DriverDashboard = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const lastLocationSentAtRef = useRef(0);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const [readyResponse, activeResponse, profileResponse] = await Promise.all([
        api.get("/api/driver-ops/orders/ready", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/driver-ops/orders/active", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/driver-ops/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setReadyOrders(readyResponse.data);
      setActiveOrders(activeResponse.data);
      setIsOnline(Boolean(profileResponse.data?.is_online));
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load driver dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const intervalId = window.setInterval(() => {
      loadDashboard();
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isOnline || !navigator.geolocation) {
      return;
    }

    const sendLocation = async (lat, lng) => {
      try {
        const token = localStorage.getItem("token");
        await api.patch(
          "/api/driver-ops/location",
          { lat, lng },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (err) {
        console.error("Location update failed:", err);
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastLocationSentAtRef.current < 30000) {
          return;
        }
        lastLocationSentAtRef.current = now;
        sendLocation(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline]);

  const claimOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/driver-ops/orders/${orderId}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to claim order.");
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      const updatedOrder = await api.patch(
        `/api/driver-ops/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (status === "DELIVERED") {
        setSuccessMessage(
          `Delivery completed. You earned $${updatedOrder.data.delivery_fee.toFixed(2)}.`,
        );
        window.setTimeout(() => setSuccessMessage(""), 4000);
      }

      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update status.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-slate-900">Driver Dashboard</h1>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600">{error}</div>}
      {successMessage && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700">{successMessage}</div>
      )}

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Ready Orders</h2>
        {readyOrders.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 text-slate-500">No ready orders available.</div>
        ) : (
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Order #{order.id}</p>
                  <p className="text-slate-700 font-semibold">Status: {order.status}</p>
                  <p className="text-slate-500 text-sm">
                    Ready at:{" "}
                    {order.ready_for_pickup_at
                      ? new Date(order.ready_for_pickup_at).toLocaleTimeString()
                      : "-"}
                  </p>
                </div>
                <button
                  onClick={() => claimOrder(order.id)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Claim
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">My Active Deliveries</h2>
        {activeOrders.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 text-slate-500">No active deliveries.</div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Order #{order.id}</p>
                  <p className="text-slate-700 font-semibold">Status: {order.status}</p>
                  <p className="text-slate-500 text-sm">Delivery fee: ${order.delivery_fee.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  {order.status === "PREPARING" && (
                    <button
                      onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Confirm Pickup
                    </button>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => updateStatus(order.id, "DELIVERED")}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DriverDashboard;

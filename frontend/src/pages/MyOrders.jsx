import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async (currentOrders = []) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextOrders = response.data;

      const previousById = new Map(currentOrders.map((order) => [order.id, order]));
      for (const order of nextOrders) {
        const previous = previousById.get(order.id);
        if (previous?.status === "PENDING" && order.status === "PAID") {
          setToastMessage(`Payment Successful for Order #${order.id}`);
          break;
        }
      }

      setOrders(nextOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e, orderId) => {
    e.stopPropagation(); // Prevents navigating to order details when clicking the button
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/orders/${orderId}/confirm-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchOrders(orders);
    } catch (err) {
      console.error("Payment failed:", err);
      alert("Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrders([]);
  }, []);

  useEffect(() => {
    const hasPendingOrder = orders.some((order) => order.status === "PENDING");
    if (!hasPendingOrder) return;

    const intervalId = window.setInterval(() => {
      fetchOrders(orders);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [orders]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = window.setTimeout(() => setToastMessage(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">
        Loading your history...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg">
          {toastMessage}
        </div>
      )}

      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        My Order History
      </h1>

      {orders.length === 0 ? (
        <div className="bg-slate-50 p-10 rounded-2xl text-center text-slate-500">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/order-status/${order.id}`)}
              className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
                  Order #{order.id}
                </p>
                <h3 className="text-lg font-bold text-slate-800">
                  Restaurant ID: {order.restaurant_id}
                </h3>
                <p className="text-slate-500 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Transaction ID: {order.payment_reference || "Pending"}
                </p>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-xl font-black text-slate-900">
                  ${order.total_amount.toFixed(2)}
                </p>
                
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* --- PAY NOW BUTTON --- */}
                  {order.status === "PENDING" && (
                    <button 
                      onClick={(e) => handlePay(e, order.id)}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

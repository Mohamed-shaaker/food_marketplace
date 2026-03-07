import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [pendingPollingIds, setPendingPollingIds] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async (currentOrders = []) => {
    try {
      const response = await axios.get("/api/orders/my");
      const nextOrders = response.data;

      const previousById = new Map(
        currentOrders.map((order) => [order.id, order]),
      );
      for (const order of nextOrders) {
        const previous = previousById.get(order.id);
        if (previous?.status === "PENDING" && order.status === "PAID") {
          setToastMessage(`Payment Successful for Order #${order.id}`);
          setPendingPollingIds((ids) => ids.filter((id) => id !== order.id));
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
    e.stopPropagation();
    const phoneNumber = phoneNumbers[orderId]?.trim();
    if (!phoneNumber) {
      setErrorMessage("Enter a Uganda mobile money number before paying.");
      return;
    }

    setProcessingOrderId(orderId);
    setErrorMessage("");
    try {
      const response = await axios.post("/api/payments/initiate", {
        order_id: orderId,
        phone_number: phoneNumber,
      });
      setToastMessage(
        response.data.message ||
          "Please check your phone for the Mobile Money PIN prompt.",
      );
      setPendingPollingIds((ids) =>
        ids.includes(orderId) ? ids : [...ids, orderId],
      );
      await fetchOrders(orders);
    } catch (err) {
      console.error("Payment failed:", err);
      setErrorMessage(
        err.response?.data?.detail || "Payment failed. Please try again.",
      );
    } finally {
      setProcessingOrderId(null);
    }
  };

  useEffect(() => {
    fetchOrders([]);
  }, []);

  useEffect(() => {
    if (pendingPollingIds.length === 0) return;

    const intervalId = window.setInterval(() => {
      fetchOrders(orders);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [orders, pendingPollingIds]);

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
      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-600">
          {errorMessage}
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
                  {Number(order.total_amount).toLocaleString()} UGX
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
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="07XXXXXXXX"
                        value={phoneNumbers[order.id] || ""}
                        onChange={(e) =>
                          setPhoneNumbers((current) => ({
                            ...current,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="w-32 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={(e) => handlePay(e, order.id)}
                        disabled={processingOrderId === order.id}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-indigo-300"
                      >
                        {processingOrderId === order.id
                          ? "Processing..."
                          : "Pay Now"}
                      </button>
                    </div>
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

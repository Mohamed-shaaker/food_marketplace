import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext"; // 1. Import the provider

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 2. Wrap App with CartProvider */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
);

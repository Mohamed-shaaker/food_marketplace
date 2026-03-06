import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Restaurants from "./pages/Restaurants";
import Menu from "./pages/Menu";
import MyOrders from "./pages/MyOrders"; 
import RestaurantDashboard from "./pages/RestaurantDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OrderStatus from "./components/OrderStatus";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar"; // 1. Added Navbar Import

function App() {
  return (
    <Router>
      {/* 2. Place Navbar here so it shows on all pages */}
      <Navbar /> 
      
      <Routes>
        {/* Public Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Restaurant List */}
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <Restaurants />
            </ProtectedRoute>
          }
        />

        {/* Protected Dynamic Menu Page */}
        <Route
          path="/restaurants/:id"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />

        {/* Protected Order Status Confirmation Page */}
        <Route
          path="/order-status/:id"
          element={
            <ProtectedRoute>
              <OrderStatus />
            </ProtectedRoute>
          }
        />

        {/* Protected User Order History Page */}
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant-dashboard"
          element={
            <ProtectedRoute>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Automatic Redirects */}
        <Route path="/" element={<Navigate to="/restaurants" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

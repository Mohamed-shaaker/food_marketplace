import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Restaurants from "./pages/Restaurants";
import Menu from "./pages/Menu";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
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

        {/* Automatic Redirects */}
        <Route path="/" element={<Navigate to="/restaurants" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

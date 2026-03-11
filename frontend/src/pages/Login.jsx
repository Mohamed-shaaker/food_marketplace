import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios"; // Our interceptor instance

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/restaurants";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. We must use URLSearchParams to send "application/x-www-form-urlencoded"
      const formData = new URLSearchParams();

      // 2. IMPORTANT: OAuth2PasswordRequestForm expects the key "username"
      // Even though we collect an email, we must send it under the key "username"
      formData.append("username", email);
      formData.append("password", password);

      // 3. Send the request
      const response = await api.post("/auth/login", formData, {
        skipAuth: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // 4. Store the JWT
      localStorage.setItem("token", response.data.access_token);

      // 5. Success! Redirect back to where they came from (or /restaurants)
      navigate(redirectTo);
    } catch (err) {
      // Log the specific error to the console to help debugging
      console.error("Login Error:", err.response?.data);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Marketplace Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Clean, basic styling
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7f6",
  },
  card: {
    padding: "40px",
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "350px",
  },
  title: { textAlign: "center", marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#e44d26",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: { color: "red", textAlign: "center", fontSize: "14px" },
};

export default Login;

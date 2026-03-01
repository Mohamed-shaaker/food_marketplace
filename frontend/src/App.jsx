import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We call your FastAPI backend here
    axios
      .get("http://localhost:8000/api/restaurants")
      .then((response) => {
        setRestaurants(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Connection error:", err);
        setError("Could not connect to the Backend.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>🍕 Food Marketplace</h1>
      <hr />

      {loading && <p>Loading delicious food...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
        {restaurants.map((res) => (
          <div
            key={res.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <h2>{res.name}</h2>
            <p>Commission Rate: {res.commission_rate * 100}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

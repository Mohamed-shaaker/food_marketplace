import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/restaurants")
      .then((response) => {
        setRestaurants(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not connect to the Backend.");
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Use navigate instead of window.location for smoother UX
  };

  if (loading)
    return (
      <div className="p-10 text-center font-light text-slate-500">
        Finding nearby kitchens...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans">
      {/* Header Section: Deliveroo Style */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            🍕 Food Marketplace
          </h1>
          <p className="text-slate-500 mt-2 font-light text-lg">
            Select a restaurant to view its menu
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors text-slate-600 font-medium"
        >
          Logout
        </button>
      </div>

      <hr className="border-slate-100 mb-10" />

      {error && (
        <p className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-center">
          {error}
        </p>
      )}

      {/* Grid: DoorDash Style spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((res) => (
          <div
            key={res.id}
            onClick={() => navigate(`/restaurants/${res.id}`)}
            className="group cursor-pointer bg-white border border-slate-100 rounded-2xl p-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Visual Header for the Card */}
            <div className="h-40 bg-slate-100 flex items-center justify-center text-4xl group-hover:bg-orange-50 transition-colors">
              🥘
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                {res.name}
              </h2>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                  Owner Portal
                </span>
                <span className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full text-sm">
                  {res.commission_rate * 100}% Fee
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Restaurants;

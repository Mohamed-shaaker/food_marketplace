import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { pingBackend } from "../api/axios";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    pingBackend()
      .then(() => {
        setBackendStatus("reachable");
      })
      .catch(() => {
        setBackendStatus("unreachable");
      });

    api
      .get("/api/restaurants")
      .then((response) => {
        setRestaurants(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to the Backend.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-light">
            Finding nearby kitchens...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto p-8 font-sans">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              🍕 Food Marketplace
            </h1>
            <p className="text-slate-500 mt-2 font-light text-lg">
              Select a restaurant to view its menu
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl mb-8 text-center shadow-sm">
            {error}
            <div className="mt-2 text-sm text-red-400">
              Backend health: {backendStatus}
            </div>
            <button
              type="button"
              onClick={() => {
                pingBackend()
                  .then(() => setBackendStatus("reachable"))
                  .catch(() => setBackendStatus("unreachable"));
              }}
              className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              Ping backend
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {restaurants.map((res) => (
            <div
              key={res.id}
              onClick={() => navigate(`/restaurants/${res.id}`)}
              className="group cursor-pointer bg-white border border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out shadow-sm"
            >
              <div className="h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                {res.image_url ? (
                  <img
                    src={res.image_url}
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <span className="text-5xl group-hover:scale-125 transition-transform duration-500">
                    🥘
                  </span>
                )}
              </div>

              <div className="p-7">
                <h2 className="text-2xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                  {res.name}
                </h2>
                <div className="flex items-center justify-between mt-6">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Premium Partner
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-orange-600 font-bold bg-orange-50 px-4 py-1.5 rounded-full text-sm border border-orange-100 shadow-sm">
                      Fee: {(res.commission_rate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Restaurants;

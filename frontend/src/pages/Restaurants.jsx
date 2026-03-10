import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Clock, AlertCircle } from "lucide-react";
import api, { pingBackend } from "../api/axios";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    pingBackend()
      .then(() => setBackendStatus("reachable"))
      .catch(() => setBackendStatus("unreachable"));

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

  const filteredRestaurants = restaurants.filter((res) =>
    res.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-500 font-light">Loading restaurants...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-12">
      {/* Sticky Top Header with Glassmorphism Search */}
      <div className="sticky top-0 z-20 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto p-4 md:px-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-transparent rounded-2xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-gray-200 focus:ring-0 outline-none transition-all duration-300"
              placeholder="What are you craving?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans mt-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl mb-8 flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-sm text-red-400 mt-1">Backend health: {backendStatus}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRestaurants.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">We couldn't find any restaurants matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-6 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Deliveroo-Style Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((res) => (
            <div
              key={res.id}
              onClick={() => navigate(`/restaurants/${res.id}`)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-300 relative border border-gray-100/50"
            >
              {/* Image Section (aspect-video) */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {res.image_url ? (
                  <img
                    src={res.image_url}
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-4xl text-gray-400">🍽️</span>
                  </div>
                )}
                
                {/* Deliveroo Specifics: Gradient Bottom Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

                {/* Content over image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 shadow-sm drop-shadow-md">
                    {res.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-sm font-semibold">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{res.rating || "New"}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-sm font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>15-25 min</span>
                    </div>
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

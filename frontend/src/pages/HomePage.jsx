import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useShopStore } from '../store';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [filter, setFilter] = useState('');
  const { shops, setShops } = useShopStore();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchNearbyShops(latitude, longitude);
        },
        (error) => {
          toast.error('Unable to get your location');
          setLoading(false);
        }
      );
    }
  }, []);

  const fetchNearbyShops = async (latitude, longitude) => {
    try {
      const res = await api.get('/shops/nearby', {
        params: {
          latitude,
          longitude,
          maxDistance: 5,
        },
      });
      setShops(res.data.data);
    } catch (error) {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(filter.toLowerCase()) ||
    shop.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-light">
      {/* Search Section */}
      <div className="bg-white shadow-md sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search shops, categories..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-500">Loading nearby shops...</div>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-xl">No shops found in your area</p>
            <p className="text-sm mt-2">Try adjusting your search or location</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Shops Near You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map(shop => (
                <Link
                  key={shop._id}
                  to={`/shop/${shop._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:scale-105"
                >
                  {shop.bannerImage && (
                    <img
                      src={shop.bannerImage}
                      alt={shop.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{shop.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{shop.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs">
                        {shop.category}
                      </span>
                      <span className="text-yellow-500">⭐ {shop.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      {shop.location.city} • {shop.totalOrders} orders
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

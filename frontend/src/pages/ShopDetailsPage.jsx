import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCartStore } from '../store';
import toast from 'react-hot-toast';

export default function ShopDetailsPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const [shopRes, productsRes] = await Promise.all([
        api.get(`/shops/${shopId}`),
        api.get(`/products/shop/${shopId}`),
      ]);
      setShop(shopRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      toast.error('Failed to load shop details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      shopId,
    });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Shop not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Shop Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {shop.bannerImage && (
            <img
              src={shop.bannerImage}
              alt={shop.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
              <p className="text-gray-600 mb-4">{shop.description}</p>
              <div className="flex gap-6 text-sm">
                <span>📍 {shop.location.address}</span>
                <span>⭐ {shop.rating.toFixed(1)} ({shop.totalReviews} reviews)</span>
                <span>📞 {shop.contactNumber}</span>
              </div>
              {shop.operatingHours && (
                <p className="text-sm text-gray-600 mt-2">
                  Hours: {shop.operatingHours.open} - {shop.operatingHours.close}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-lg font-bold text-primary">₹{product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice}
                        </p>
                      )}
                    </div>
                    <span className="text-yellow-500 text-sm">⭐ {product.rating}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable}
                    className={`w-full py-2 rounded-lg transition ${
                      product.isAvailable
                        ? 'bg-primary text-white hover:opacity-90'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

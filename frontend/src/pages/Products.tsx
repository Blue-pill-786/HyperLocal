import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';

// Mock data - Replace with API call
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Organic Vegetables Bundle',
    price: 25.99,
    originalPrice: 35.99,
    image: 'https://via.placeholder.com/200',
    category: 'Groceries',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Handmade Coffee Mug',
    price: 15.99,
    image: 'https://via.placeholder.com/200',
    category: 'Crafts',
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Fresh Bakery Items',
    price: 12.50,
    originalPrice: 15.00,
    image: 'https://via.placeholder.com/200',
    category: 'Food',
    rating: 4.6,
  },
];

export default function Products() {
  const [products] = useState(MOCK_PRODUCTS);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-12">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="relative overflow-hidden h-48 bg-gray-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow">
                <Heart size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <Link to={`/products/${product.id}`} className="font-semibold hover:text-blue-600">
                {product.name}
              </Link>
              <div className="flex items-center mt-2 mb-4">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

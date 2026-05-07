import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Welcome to HyperLocal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover local products and services from your neighborhood
        </p>
        <Link
          to="/products"
          className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Shop Now <ArrowRight className="ml-2" />
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="text-xl font-bold mb-2">Local Sellers</h3>
          <p className="text-gray-600">
            Support local businesses in your community
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">Get products delivered quickly from nearby sellers</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold mb-2">Quality Assured</h3>
          <p className="text-gray-600">All products verified by our quality team</p>
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@stores/cartStore';
import { useAuthStore } from '@stores/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              HyperLocal
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link to="/cart" className="relative text-gray-600 hover:text-gray-900">
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </Link>
            {user ? (
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                <User size={24} />
              </Link>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-gray-600 hover:text-gray-900 py-2">
              Home
            </Link>
            <Link to="/products" className="block text-gray-600 hover:text-gray-900 py-2">
              Products
            </Link>
            <Link to="/cart" className="block text-gray-600 hover:text-gray-900 py-2">
              Cart ({cartItems.length})
            </Link>
            {user ? (
              <Link to="/profile" className="block text-gray-600 hover:text-gray-900 py-2">
                Profile
              </Link>
            ) : (
              <Link to="/login" className="block text-gray-600 hover:text-gray-900 py-2">
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

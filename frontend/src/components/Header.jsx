import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore, useUIStore } from '../store';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-black tracking-tight text-primary">
          HyperLocal
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 dark:text-slate-200 md:flex">
          <Link to="/" className="hover:text-primary">Browse</Link>
          {isAuthenticated && <Link to="/orders" className="hover:text-primary">Orders</Link>}
          {user?.role === 'shop_owner' && <Link to="/dashboard" className="hover:text-primary">Shop</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-primary">Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="h-10 w-10 rounded-full border border-slate-200 text-sm dark:border-slate-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? 'Sun' : 'Moon'}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative rounded-full border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                Cart
                {cart.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">{cart.length}</span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

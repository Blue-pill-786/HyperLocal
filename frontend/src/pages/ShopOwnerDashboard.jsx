import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'accepted', 'rejected', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'];
const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ShopOwnerDashboard() {
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', category: '', description: '', imageUrl: '' });

  const socket = useMemo(
    () => io((process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '')),
    []
  );

  const fetchDashboardData = async () => {
    try {
      const [shopRes, ordersRes] = await Promise.all([
        api.get('/shops/owner/my-shop'),
        api.get('/orders/shop/orders'),
      ]);
      setShop(shopRes.data.data);
      setOrders(ordersRes.data.data);
      const productsRes = await api.get(`/products/shop/${shopRes.data.data._id}`);
      setProducts(productsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!shop?._id) return undefined;
    socket.emit('join_shop_queue', shop._id);
    socket.on('order_updated', () => {
      toast.success('Order queue updated');
      fetchDashboardData();
    });
    return () => socket.disconnect();
  }, [shop?._id, socket]);

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.orderStatus === 'completed');
    const productCounts = {};
    orders.forEach((order) => {
      order.products?.forEach((item) => {
        const name = item.product?.name || 'Product';
        productCounts[name] = (productCounts[name] || 0) + item.quantity;
      });
    });
    const popularProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return {
      totalOrders: orders.length,
      earnings: completed.reduce((sum, order) => sum + order.totalAmount, 0),
      popularProducts,
    };
  }, [orders]);

  const handleUpdateOrderStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      toast.success('Order status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/products/shop/${shop._id}`, {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        images: productForm.imageUrl ? [productForm.imageUrl] : [],
      });
      setProductForm({ name: '', price: '', stock: '', category: '', description: '', imageUrl: '' });
      toast.success('Product added');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">{shop?.name || 'Shop Dashboard'}</h1>
          <p className="mt-1 text-slate-500">{shop?.description || 'Manage orders, menu, hours, and pickup flow.'}</p>
          <p className="mt-2 text-sm text-slate-500">Hours: {shop?.operatingHours?.open || '09:00'} - {shop?.operatingHours?.close || '18:00'}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Orders" value={stats.totalOrders} />
          <StatCard label="Earnings" value={`Rs. ${stats.earnings.toFixed(0)}`} />
          <StatCard label="Products" value={products.length} />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-6 flex gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            {['orders', 'products', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${activeTab === tab ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{order.orderNumber}</p>
                      <p className="text-sm text-slate-500">{order.buyer?.name} · Rs. {order.totalAmount.toFixed(2)}</p>
                      <p className="mt-1 text-sm text-slate-500">{order.products?.map((item) => `${item.product?.name} x ${item.quantity}`).join(', ')}</p>
                    </div>
                    <select
                      value={order.orderStatus}
                      onChange={(event) => handleUpdateOrderStatus(order._id, event.target.value)}
                      className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    >
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="py-8 text-center text-slate-500">No orders yet.</p>}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
              <form onSubmit={handleCreateProduct} className="space-y-3">
                {['name', 'price', 'stock', 'category', 'imageUrl'].map((field) => (
                  <input
                    key={field}
                    name={field}
                    value={productForm[field]}
                    onChange={(event) => setProductForm({ ...productForm, [field]: event.target.value })}
                    placeholder={field}
                    required={['name', 'price', 'stock'].includes(field)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  />
                ))}
                <textarea
                  value={productForm.description}
                  onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  placeholder="description"
                  className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                />
                <button className="w-full rounded-full bg-primary py-3 font-bold text-white">Add Product</button>
              </form>
              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <div key={product._id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <p className="font-bold text-slate-950 dark:text-white">{product.name}</p>
                    <p className="text-sm text-slate-500">Rs. {product.price} · Stock {product.stock}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="mb-3 text-xl font-bold text-slate-950 dark:text-white">Popular Products</h2>
              {stats.popularProducts.length === 0 ? <p className="text-slate-500">No product sales yet.</p> : stats.popularProducts.map(([name, count]) => (
                <div key={name} className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-800">
                  <span>{name}</span><span>{count} sold</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-primary">{value}</p>
    </div>
  );
}

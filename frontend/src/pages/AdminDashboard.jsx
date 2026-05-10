import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [shops, setShops] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdmin = async () => {
    try {
      const [overviewRes, shopsRes, transactionsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/shops'),
        api.get('/admin/transactions'),
      ]);
      setOverview(overviewRes.data.data);
      setShops(shopsRes.data.data);
      setTransactions(transactionsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  const updateApproval = async (shopId, isApproved) => {
    await api.patch(`/admin/shops/${shopId}/approval`, { isApproved });
    toast.success(isApproved ? 'Shop approved' : 'Shop hidden');
    loadAdmin();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading admin...</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Admin Dashboard</h1>
        <section className="grid gap-4 md:grid-cols-4">
          <Stat label="Users" value={overview?.users || 0} />
          <Stat label="Shops" value={overview?.shops || 0} />
          <Stat label="Orders" value={overview?.orders || 0} />
          <Stat label="Revenue" value={`Rs. ${(overview?.revenue || 0).toFixed(0)}`} />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Manage Shops</h2>
          <div className="space-y-3">
            {shops.map((shop) => (
              <div key={shop._id} className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{shop.name}</p>
                  <p className="text-sm text-slate-500">{shop.owner?.email} · {shop.category}</p>
                </div>
                <button
                  onClick={() => updateApproval(shop._id, !shop.isApproved)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${shop.isApproved ? 'bg-slate-200 text-slate-700' : 'bg-primary text-white'}`}
                >
                  {shop.isApproved ? 'Hide' : 'Approve'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr><th className="py-2">Order</th><th>Shop</th><th>User</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {transactions.map((payment) => (
                  <tr key={payment._id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-3">{payment.orderId?.orderNumber}</td>
                    <td>{payment.shopId?.name}</td>
                    <td>{payment.userId?.email}</td>
                    <td>Rs. {payment.amount}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-primary">{value}</p>
    </div>
  );
}

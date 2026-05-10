import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ORDER_STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'completed'];
const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const socket = useMemo(
    () => io((process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '')),
    []
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = orderId ? await api.get(`/orders/${orderId}`) : await api.get('/orders/user/orders');
        if (orderId) setOrder(res.data.data);
        else setOrders(res.data.data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return undefined;
    socket.emit('join_order', orderId);
    socket.on('status_changed', (payload) => {
      setOrder((current) => current && { ...current, orderStatus: payload.orderStatus });
      toast.success(`Order ${STATUS_LABELS[payload.orderStatus] || payload.orderStatus}`);
    });
    return () => socket.disconnect();
  }, [orderId, socket]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading orders...</div>;
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-slate-950 dark:text-white">Order History</h1>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-900">No orders yet.</div>
            ) : (
              orders.map((item) => (
                <Link key={item._id} to={`/order/${item._id}`} className="block rounded-lg bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{item.orderNumber}</p>
                      <p className="text-sm text-slate-500">{item.shop?.name} · {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">Rs. {item.totalAmount.toFixed(2)}</p>
                      <p className="text-sm capitalize text-slate-500">{STATUS_LABELS[item.orderStatus]}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Order not found</div>;
  }

  const statusIndex = ORDER_STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{order.orderNumber}</h1>
              <p className="mt-1 text-sm text-slate-500">{order.shop?.name} · {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xl font-black text-primary">Rs. {order.totalAmount.toFixed(2)}</p>
              <p className="text-sm capitalize text-slate-500">{order.paymentStatus}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-5 text-xl font-bold text-slate-950 dark:text-white">Live Status</h2>
          <div className="space-y-4">
            {ORDER_STATUS_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${index <= statusIndex ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  {index <= statusIndex ? 'OK' : index + 1}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-100">{STATUS_LABELS[step]}</span>
              </div>
            ))}
          </div>
        </section>

        {order.pickupCode && (
          <section className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 text-center shadow-sm dark:bg-slate-900">
            <QRCodeCanvas value={`${order.orderNumber}:${order.pickupCode}`} size={148} />
            <p className="text-sm text-slate-500">Pickup code</p>
            <p className="text-2xl font-black tracking-widest text-slate-950 dark:text-white">{order.pickupCode}</p>
          </section>
        )}

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Items</h2>
          <div className="space-y-2">
            {order.products?.map((item) => (
              <div key={item._id || item.product?._id} className="flex justify-between text-sm text-slate-700 dark:text-slate-200">
                <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

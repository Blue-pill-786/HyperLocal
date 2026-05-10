import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        shopId: cart[0]?.shopId,
        products: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        specialInstructions,
      });
      const order = orderRes.data.data;

      const razorpayReady = await loadRazorpay();
      if (razorpayReady && process.env.REACT_APP_RAZORPAY_KEY_ID) {
        const paymentRes = await api.post('/payments/create-order', { orderId: order._id });
        const payment = paymentRes.data.data;

        const checkout = new window.Razorpay({
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: Math.round(payment.amount * 100),
          currency: payment.currency,
          name: 'HyperLocal',
          description: `Pickup order ${order.orderNumber}`,
          order_id: payment.razorpayOrderId,
          method: { upi: true, card: false, netbanking: false, wallet: false },
          handler: async (response) => {
            await api.post('/payments/verify', {
              paymentId: payment.paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('UPI payment successful');
            clearCart();
            navigate(`/order/${order._id}`);
          },
          theme: { color: '#FF6B35' },
        });

        checkout.on('payment.failed', () => toast.error('Payment failed. You can retry from your order.'));
        checkout.open();
        return;
      }

      toast.success('Order placed. Add Razorpay keys to enable live UPI checkout.');
      clearCart();
      navigate(`/order/${order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Your cart is empty</h2>
          <p className="mb-6 mt-2 text-slate-500">Add a quick pickup order from a nearby shop.</p>
          <button onClick={() => navigate('/')} className="rounded-full bg-primary px-6 py-3 font-semibold text-white">
            Browse Shops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
          <h1 className="mb-5 text-2xl font-bold text-slate-950 dark:text-white">Pickup Cart</h1>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 py-4">
                <img src={item.image || 'https://placehold.co/160x160?text=Item'} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-950 dark:text-white">{item.name}</h3>
                  <p className="text-primary">Rs. {item.price}</p>
                  <button onClick={() => removeFromCart(item.id)} className="mt-2 text-sm text-red-600">Remove</button>
                </div>
                <div className="flex h-10 items-center rounded-full border border-slate-200 dark:border-slate-700">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="h-10 w-10">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-10 w-10">+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Checkout</h2>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Pickup notes</label>
          <textarea
            value={specialInstructions}
            onChange={(event) => setSpecialInstructions(event.target.value)}
            className="mb-5 h-24 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-950"
            placeholder="Example: no onions, pick up at 1:15 PM"
          />
          <div className="mb-5 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Pickup fee</span><span>Rs. 0</span></div>
            <div className="flex justify-between text-lg font-black text-slate-950 dark:text-white"><span>Total</span><span>Rs. {totalPrice.toFixed(2)}</span></div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? 'Creating Order...' : 'Pay with UPI'}
          </button>
        </aside>
      </div>
    </div>
  );
}

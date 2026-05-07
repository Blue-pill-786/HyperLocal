import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  zipCode: z.string().min(5, 'ZIP code required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      // TODO: Process payment
      console.log('Processing payment...', data);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Shipping Address */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full border rounded px-4 py-2"
              />
              {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full border rounded px-4 py-2"
              />
              {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full border rounded px-4 py-2"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full border rounded px-4 py-2"
              />
              {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            {...register('address')}
            type="text"
            className="w-full border rounded px-4 py-2"
          />
          {errors.address && <p className="text-red-600 text-sm">{errors.address.message}</p>}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              {...register('city')}
              type="text"
              className="w-full border rounded px-4 py-2"
            />
            {errors.city && <p className="text-red-600 text-sm">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              {...register('state')}
              type="text"
              className="w-full border rounded px-4 py-2"
            />
            {errors.state && <p className="text-red-600 text-sm">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code</label>
            <input
              {...register('zipCode')}
              type="text"
              className="w-full border rounded px-4 py-2"
            />
            {errors.zipCode && <p className="text-red-600 text-sm">{errors.zipCode.message}</p>}
          </div>
        </div>

        {/* Payment */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              {...register('cardNumber')}
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full border rounded px-4 py-2"
            />
            {errors.cardNumber && <p className="text-red-600 text-sm">{errors.cardNumber.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}

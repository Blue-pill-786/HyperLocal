import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

export const useCartStore = create((set) => ({
  cart: JSON.parse(localStorage.getItem('cart')) || [],
  
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    const differentShop = state.cart.length > 0 && state.cart[0].shopId !== product.shopId;
    let newCart;
    
    if (differentShop) {
      newCart = [{ ...product, quantity: product.quantity || 1 }];
    } else
    if (existing) {
      newCart = state.cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + (product.quantity || 1) }
          : item
      );
    } else {
      newCart = [...state.cart, { ...product, quantity: product.quantity || 1 }];
    }
    
    localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  
  removeFromCart: (productId) => set((state) => {
    const newCart = state.cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  
  updateQuantity: (productId, quantity) => set((state) => {
    const newCart = state.cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    localStorage.setItem('cart', JSON.stringify(newCart));
    return { cart: newCart };
  }),
  
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ cart: [] });
  },
}));

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  
  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders],
  })),
}));

export const useShopStore = create((set) => ({
  shops: [],
  currentShop: null,
  nearbyShops: [],
  
  setShops: (shops) => set({ shops }),
  setCurrentShop: (shop) => set({ currentShop: shop }),
  setNearbyShops: (shops) => set({ nearbyShops: shops }),
}));

export const useUIStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  
  toggleDarkMode: () => set((state) => {
    const newValue = !state.darkMode;
    localStorage.setItem('darkMode', newValue);
    return { darkMode: newValue };
  }),
}));

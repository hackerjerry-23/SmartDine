import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { menuItem: id, name, price, quantity }
  const [tableNumber, setTableNumber] = useState(null); // set via QR check-in

  const addItem = (menuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem === menuItem._id);
      if (existing) {
        return prev.map((i) => (i.menuItem === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem !== menuItemId));
      return;
    }
    setItems((prev) => prev.map((i) => (i.menuItem === menuItemId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, clearCart, total, tableNumber, setTableNumber }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

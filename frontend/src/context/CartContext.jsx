import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

// The cart lives in the browser (localStorage) so it survives a page refresh.
// Each item: { id, slug, title, price, image, stock, quantity }
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: Number(product.price),
          image: product.image,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });

  const setQuantity = (id, quantity) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
    );

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, setQuantity, removeItem, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export const useCart = () => useContext(CartContext);

import { createContext, useContext, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

// Create Context
const CartContext = createContext();

// Custom hook
export const useCart = () => useContext(CartContext);

// Provider
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==============================
  // FETCH AVAILABLE ITEMS
  // ==============================
  const fetchAvailableItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "availableItems"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAvailableItems(items);
    } catch (error) {
      toast.error("Error loading items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ADD OR UPDATE AVAILABLE ITEM
  // ==============================
  const updateAvailableItem = async (item) => {
    try {
      await setDoc(doc(db, "availableItems", item.id), item);
      await fetchAvailableItems();
      toast.success("Item saved successfully!");
      return true;
    } catch (error) {
      toast.error("Error saving item: " + error.message);
      return false;
    }
  };

  // ==============================
  // DELETE AVAILABLE ITEM
  // ==============================
  const deleteAvailableItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteDoc(doc(db, "availableItems", id));
      await fetchAvailableItems();
      toast.success("Item deleted successfully!");
    } catch (error) {
      toast.error("Error deleting item: " + error.message);
    }
  };

  // ==============================
  // CART OPERATIONS
  // ==============================
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => setCart([]);

  // ==============================
  // ADD ITEMS TO AVAILABLE STOCK
  // ==============================
  const addToAvailableItems = async (items) => {
    try {
      for (const item of items) {
        const existing = availableItems.find((i) => i.id === item.id);

        await setDoc(doc(db, "availableItems", item.id), {
          ...item,
          quantity: existing
            ? existing.quantity + item.quantity
            : item.quantity,
        });
      }
      await fetchAvailableItems();
      toast.success("Stock updated successfully!");
    } catch (error) {
      toast.error("Error updating stock: " + error.message);
    }
  };

  // ==============================
  // TOTALS
  // ==============================
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ==============================
  // PROVIDER
  // ==============================
  return (
    <CartContext.Provider
      value={{
        cart,
        availableItems,
        loading,

        fetchAvailableItems,
        updateAvailableItem,
        deleteAvailableItem,
        addToAvailableItems,

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

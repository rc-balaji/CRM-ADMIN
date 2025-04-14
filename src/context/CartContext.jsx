// context/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchAvailableItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "availableItems"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setAvailableItems(items);
    } catch (error) {
      toast.error("Error loading items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableItems();
  }, []);

  // Add or update item in availableItems
  const updateAvailableItem = async (item) => {
    try {
      await setDoc(doc(db, "availableItems", item.id), item);
      await fetchAvailableItems();
      toast.success("Item updated successfully!");
      return true;
    } catch (error) {
      toast.error("Error updating item: " + error.message);
      return false;
    }
  };

  // Delete item from availableItems
  const deleteAvailableItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "availableItems", id));
        await fetchAvailableItems();
        toast.success("Item deleted successfully!");
      } catch (error) {
        toast.error("Error deleting item: " + error.message);
      }
    }
  };

  // Load available items from Firestore
  useEffect(() => {
    const fetchAvailableItems = async () => {
      const querySnapshot = await getDocs(collection(db, "availableItems"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setAvailableItems(items);
    };
    fetchAvailableItems();
  }, []);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Add items to availableItems collection
  const addToAvailableItems = async (items) => {
    try {
      for (const item of items) {
        // Check if item already exists
        const existingItem = availableItems.find(
          (avItem) => avItem.id === item.id
        );

        if (existingItem) {
          // Update existing item
          await setDoc(doc(db, "availableItems", item.id), {
            ...item,
            quantity: existingItem.quantity + item.quantity,
          });
        } else {
          // Add new item
          await setDoc(doc(db, "availableItems", item.id), {
            ...item,
          });
        }
      }
      toast.success("Items added to available stock!");
    } catch (error) {
      toast.error("Error updating available items: " + error.message);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        availableItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToAvailableItems,
        updateAvailableItem,
        fetchAvailableItems,

        deleteAvailableItem,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

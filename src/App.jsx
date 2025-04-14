import React, { useEffect, useState, createContext } from "react";
import { db } from "./firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { useCart } from "./context/CartContext";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { motion } from "framer-motion";
import Switch from "react-switch";
import Cart from "./components/Cart";
import AvailableItems from "./components/AvailableItems";

// Create a context for edit mode
const EditModeContext = createContext();

const categories = ["morning_food", "lunch", "snacks", "chocolate", "drink"];

export default function App() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "morning_food",
    id: null,
  });
  const [editMode, setEditMode] = useState(false);
  const { addToCart, cart } = useCart();

  const fetchItems = async () => {
    const data = await getDocs(collection(db, "menuItems"));
    const itemsList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setItems(itemsList);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateDoc(doc(db, "menuItems", form.id), {
          name: form.name,
          price: +form.price,
          image: form.image,
          category: form.category,
        });
        toast.success("Item Updated Successfully!");
      } else {
        await addDoc(collection(db, "menuItems"), {
          name: form.name,
          price: +form.price,
          image: form.image,
          category: form.category,
        });
        toast.success("Item Added Successfully!");
      }
      setForm({
        name: "",
        price: "",
        image: "",
        category: "morning_food",
        id: null,
      });
      setShowModal(false);
      fetchItems();
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "menuItems", id));
        fetchItems();
        toast.success("Item Deleted Successfully!");
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setShowModal(true);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode }}>
      <Router>
        <div className="container my-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="d-flex align-items-center"
            >
              <Link to="/available-items">
                <Button variant="info">Available Items</Button>
              </Link>
              🍽 Menu Items
              <Badge bg="info" className="ms-2">
                {items.length} items
              </Badge>
            </motion.h2>

            <div className="d-flex align-items-center">
              <div className="me-3 d-flex align-items-center">
                <span className="me-2">
                  {editMode ? <FaEdit /> : <FaShoppingCart />}
                </span>
                <Switch
                  onChange={() => setEditMode(!editMode)}
                  checked={editMode}
                  onColor="#0d6efd"
                  offColor="#6c757d"
                  checkedIcon={false}
                  uncheckedIcon={false}
                  height={20}
                  width={48}
                />
                <span className="ms-2">
                  {editMode ? "Edit Mode" : "View Mode"}
                </span>
              </div>

              <Link to="/cart">
                <Button variant="info" className="position-relative">
                  Cart
                  {cart.length > 0 && (
                    <Badge
                      bg="danger"
                      className="position-absolute top-0 start-100 translate-middle rounded-pill"
                    >
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          <Routes>
            <Route
              path="/"
              element={
                <div className="menu-items">
                  {categories.map((cat) => (
                    <motion.div
                      key={cat}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="mt-4 text-capitalize">
                        {cat.replace("_", " ")}
                      </h4>
                      <div className="row">
                        {items
                          .filter((item) => item.category === cat)
                          .map((item) => (
                            <div className="col-md-3 mb-4" key={item.id}>
                              <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="card h-100 shadow-sm"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="card-img-top"
                                  style={{
                                    height: "180px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="card-body d-flex flex-column">
                                  <h5 className="card-title">{item.name}</h5>
                                  <p className="card-text text-success fw-bold">
                                    ₹{item.price}
                                  </p>
                                  <div className="mt-auto">
                                    {editMode ? (
                                      <div className="d-flex justify-content-between">
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() => handleEdit(item)}
                                        >
                                          <FaEdit className="me-1" /> Edit
                                        </Button>
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => handleDelete(item.id)}
                                        >
                                          <FaTrash className="me-1" /> Delete
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="success"
                                        size="sm"
                                        className="w-100"
                                        onClick={() => handleAddToCart(item)}
                                      >
                                        <FaShoppingCart className="me-1" /> Add
                                        to Cart
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              }
            />

            <Route path="/cart" element={<Cart />} />

            <Route path="/available-items" element={<AvailableItems />} />
          </Routes>

          {/* Add Item Button (only visible in edit mode) */}
          {editMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="position-fixed bottom-0 end-0 m-4"
            >
              <Button
                variant="primary"
                size="lg"
                className="rounded-circle shadow"
                style={{ width: "60px", height: "60px" }}
                onClick={() => {
                  setForm({
                    name: "",
                    price: "",
                    image: "",
                    category: "morning_food",
                    id: null,
                  });
                  setShowModal(true);
                }}
              >
                +
              </Button>
            </motion.div>
          )}

          {/* Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {form.id ? "Edit Menu Item" : "Add New Menu Item"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Enter item name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                    placeholder="Enter price"
                    min="0"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    required
                    placeholder="Enter image URL"
                  />
                  {form.image && (
                    <div className="mt-2">
                      <small>Image Preview:</small>
                      <img
                        src={form.image}
                        alt="Preview"
                        className="img-thumbnail mt-1"
                        style={{ maxHeight: "100px" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button
                  type="submit"
                  variant={form.id ? "primary" : "success"}
                  className="w-100"
                >
                  {form.id ? "Update Item" : "Add Item"}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </EditModeContext.Provider>
  );
}

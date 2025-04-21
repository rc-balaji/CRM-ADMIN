import React, { useState, useEffect, useContext } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { EditModeContext } from "../App";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const categories = ["morning_food", "lunch", "snacks", "chocolate", "drink"];

export default function MenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "morning_food",
    id: null,
  });
  const { editMode } = useContext(EditModeContext);
  const { addToCart } = useCart();

  const fetchItems = async () => {
    try {
      const data = await getDocs(collection(db, "menuItems"));
      const itemsList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setItems(itemsList);
    } catch (error) {
      toast.error("Error loading menu items");
    } finally {
      setLoading(false);
    }
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

  const openAddModal = () => {
    setForm({
      name: "",
      price: "",
      image: "",
      category: "morning_food",
      id: null,
    });
    setShowModal(true);
  };

  const renderSkeletonCards = () => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <div className="col-md-3 mb-4" key={index}>
          <div className="card h-100 shadow-sm">
            <Skeleton height={180} />
            <div className="card-body">
              <Skeleton count={2} />
              <Skeleton height={30} />
            </div>
          </div>
        </div>
      ));
  };

  return (
    <>
      <div className="menu-items">
        {categories.map((cat) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="mt-4 text-capitalize">
              {loading ? <Skeleton width={150} /> : cat.replace("_", " ")}
            </h4>
            <div className="row">
              {loading
                ? renderSkeletonCards()
                : items
                    .filter((item) => item.category === cat)
                    .map((item) => (
                      <div className="col-md-3 mb-4" key={item.id}>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          className="card h-100 shadow-sm"
                        >
                          <div className="position-relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="card-img-top"
                                style={{ height: "180px", objectFit: "cover" }}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150";
                                }}
                              />
                            ) : (
                              <Skeleton height={180} />
                            )}
                          </div>
                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">
                              {item.name || <Skeleton />}
                            </h5>
                            <p className="card-text text-success fw-bold">
                              {item.price ? (
                                `₹${item.price}`
                              ) : (
                                <Skeleton width={50} />
                              )}
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
                                  <FaShoppingCart className="me-1" /> Add to
                                  Cart
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

      <MenuItems.AddButton editMode={editMode} onAddClick={openAddModal} />
      <MenuItems.Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
      />
    </>
  );
}

MenuItems.Count = function Count() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getDocs(collection(db, "menuItems"));
        const itemsList = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setItems(itemsList);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return loading ? <Skeleton width={80} /> : <>{items.length} items</>;
};

MenuItems.AddButton = function AddButton({ editMode, onAddClick }) {
  if (!editMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="position-fixed bottom-0 end-0 m-4"
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(13, 110, 253, 0.4)",
            "0 0 0 10px rgba(13, 110, 253, 0)",
            "0 0 0 0 rgba(13, 110, 253, 0)",
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          repeatDelay: 1,
        }}
        style={{
          borderRadius: "50%",
        }}
      >
        <Button
          variant="primary"
          size="lg"
          className="rounded-circle shadow"
          style={{ width: "60px", height: "60px" }}
          onClick={onAddClick}
        >
          +
        </Button>
      </motion.div>
    </motion.div>
  );
};

MenuItems.Modal = function ItemModal({
  show,
  onHide,
  form,
  setForm,
  onSubmit,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {form?.id ? "Edit Menu Item" : "Add New Menu Item"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={form?.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Enter item name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price (₹)</Form.Label>
            <Form.Control
              type="number"
              value={form?.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              placeholder="Enter price"
              min="0"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="text"
              value={form?.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
              placeholder="Enter image URL"
            />
            {form?.image && (
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
              value={form?.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
            variant={form?.id ? "primary" : "success"}
            className="w-100"
          >
            {form?.id ? "Update Item" : "Add Item"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

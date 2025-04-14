// components/AvailableItems.jsx
import React, { useState } from "react";
import {
  Button,
  Table,
  Badge,
  Card,
  Modal,
  Form,
  Tab,
  Tabs,
  Alert,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const categories = ["morning_food", "lunch", "snacks", "chocolate", "drink"];

const AvailableItems = () => {
  const { availableItems, loading, updateAvailableItem, deleteAvailableItem } =
    useCart();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    image: "",
    quantity: "",
    category: "morning_food",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const handleEdit = (item) => {
    setForm(item);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateAvailableItem({
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
    if (success) {
      setShowModal(false);
      setForm({
        id: "",
        name: "",
        price: "",
        image: "",
        quantity: "",
        category: "morning_food",
      });
    }
  };

  const filteredItems = availableItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: availableItems.filter((item) => item.category === cat).length,
  }));

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container py-4"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          Available Items <Badge bg="primary">{availableItems.length}</Badge>
        </h2>
        <Button
          variant="success"
          onClick={() => {
            setForm({
              id: "",
              name: "",
              price: "",
              image: "",
              quantity: "",
              category: "morning_food",
            });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add New Item
        </Button>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <div className="w-50 me-3">
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </div>

            <Tabs
              activeKey={activeCategory}
              onSelect={(k) => setActiveCategory(k)}
              className="mb-3"
            >
              <Tab eventKey="all" title={`All (${availableItems.length})`} />
              {categoryCounts.map((cat) => (
                <Tab
                  key={cat.name}
                  eventKey={cat.name}
                  title={`${cat.name.replace("_", " ")} (${cat.count})`}
                />
              ))}
            </Tabs>
          </div>

          {filteredItems.length === 0 ? (
            <Alert variant="info" className="text-center">
              No items found.{" "}
              {searchTerm
                ? "Try a different search."
                : "Add some items to get started."}
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>₹{item.price}</td>
                    <td>{item.quantity}</td>
                    <td className="text-capitalize">
                      {item.category.replace("_", " ")}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteAvailableItem(item.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{form.id ? "Edit Item" : "Add New Item"}</Modal.Title>
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                required
              />
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ maxHeight: "100px" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              {form.id ? "Update Item" : "Add Item"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default AvailableItems;

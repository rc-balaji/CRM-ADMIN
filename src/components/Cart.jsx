// components/Cart.jsx
import React, { useState } from "react";
import {
  Button,
  Table,
  Badge,
  Form,
  Card,
  Modal,
  Alert,
} from "react-bootstrap";
import { FaTrash, FaArrowLeft, FaCreditCard, FaBoxOpen } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToAvailableItems,
    totalItems,
    totalPrice,
  } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAddToStockModal, setShowAddToStockModal] = useState(false);

  const handleQuantityChange = (id, e) => {
    const newQuantity = parseInt(e.target.value);
    updateQuantity(id, newQuantity);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const confirmCheckout = () => {
    clearCart();
    setShowCheckoutModal(false);
    toast.success("Order placed successfully! Thank you for your purchase.");
  };

  const handleAddToStock = () => {
    setShowAddToStockModal(true);
  };

  const confirmAddToStock = async () => {
    try {
      await addToAvailableItems(cart);
      clearCart();
      setShowAddToStockModal(false);
    } catch (error) {
      toast.error("Error adding to stock: " + error.message);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-5"
      >
        <h3>Your cart is empty</h3>
        <p className="text-muted">Add some delicious items to get started!</p>
        <Link to="/">
          <Button variant="primary" className="mt-3">
            <FaArrowLeft className="me-2" />
            Back to Menu
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cart-page py-4"
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            Your Cart <Badge bg="secondary">{totalItems}</Badge>
          </h2>
          <div>
            <Button
              variant="outline-danger"
              onClick={clearCart}
              className="me-2"
            >
              Clear Cart
            </Button>
            <Button variant="info" onClick={handleAddToStock}>
              <FaBoxOpen className="me-2" />
              Add to Available Stock
            </Button>
          </div>
        </div>

        <Table striped bordered hover responsive className="mb-4">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>

              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        marginRight: "15px",
                        borderRadius: "5px",
                      }}
                    />
                    {item.name}
                  </div>
                </td>
                <td>₹{item.price}</td>
                <td>
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e)}
                    style={{ width: "70px" }}
                  />
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <Link to="/">
            <Button variant="outline-secondary">
              <FaArrowLeft className="me-2" />
              Continue Adding
            </Button>
          </Link>
        </div>

        {/* Checkout Modal */}
        <Modal
          show={showCheckoutModal}
          onHide={() => setShowCheckoutModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Order</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You're about to place an order for:</p>
            <ul>
              {cart.map((item) => (
                <li key={item.id}>
                  {item.name} (×{item.quantity}) - ₹
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <h5 className="text-end">Total: ₹{totalPrice.toFixed(2)}</h5>
            <Form className="mt-4">
              <Form.Group className="mb-3">
                <Form.Label>Delivery Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your delivery address"
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCheckoutModal(false)}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={confirmCheckout}>
              Confirm Order
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add to Stock Modal */}
        <Modal
          show={showAddToStockModal}
          onHide={() => setShowAddToStockModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Items to Available Stock</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              This will add all items in your cart to the available stock.
            </Alert>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddToStockModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmAddToStock}>
              Confirm Add to Stock
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </motion.div>
  );
};

export default Cart;

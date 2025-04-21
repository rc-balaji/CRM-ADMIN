import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Container, Form, Button, Card, Spinner } from "react-bootstrap";
import { FaSignInAlt, FaLock, FaEnvelope } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate("/");
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error("Failed to login: " + error.message);
      setLoading(false);
    }
  }

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100 p-0 bg-light"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-100"
      >
        <div className="row g-0">
          {/* Left Side - Banner Image (wider) */}
          <div className="col-lg-8 d-none d-lg-block">
            <div
              className="h-100 bg-primary"
              style={{
                backgroundImage: "url('./image/ngp-banner.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
              }}
            >
              <div
                className="d-flex flex-column justify-content-center align-items-center h-100 p-5 text-white"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              >
                <img
                  src="https://www.drngpit.ac.in/assets/images/logo/2ngp-itech-logo.png"
                  alt="Logo"
                  style={{ width: "120px", marginBottom: "2rem" }}
                  className="border border-white rounded-circle bg-white shadow-lg"
                />
                <h1 className="display-4 fw-bold mb-3">MealStream</h1>
                <p className="lead">Dr. N.G.P. Institute of Technology</p>
                <p className="text-center" style={{ maxWidth: "600px" }}>
                  The premium food ordering system for NGPIT campus. Enjoy
                  seamless dining experience with just a few clicks.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form (fixed width) */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center justify-content-center h-100 p-5">
              <Card
                className="border-0 shadow rounded-3 w-100"
                style={{ maxWidth: "400px" }}
              >
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold">Welcome Back</h3>
                    <p className="text-muted">Please enter your credentials</p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaEnvelope className="text-muted" />
                        </span>
                        <Form.Control
                          type="email"
                          placeholder="admin@drngpit.ac.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="py-2"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <FaLock className="text-muted" />
                        </span>
                        <Form.Control
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="py-2"
                        />
                      </div>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 py-2 fw-bold"
                      disabled={loading}
                    >
                      {loading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>Sign In</>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  Button,
  Badge,
  Modal,
  Spinner,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaCheck,
  FaMoneyBillWave,
  FaArrowUp,
  FaChartBar,
  FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    timeRange: "",
    session: "",
  });

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = [];

        querySnapshot.forEach((doc) => {
          ordersData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setOrders(ordersData);
        setFilteredOrders(sortOrders(ordersData));
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let result = [...orders];

    // Status filter
    if (filters.status) {
      result = result.filter((order) => order.status === filters.status);
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      result = result.filter((order) => {
        const orderDate = new Date(order.date?.seconds * 1000);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Time range filter
    if (filters.timeRange) {
      const [startHour, endHour] = filters.timeRange.split("-").map(Number);
      result = result.filter((order) => {
        const orderHour = parseInt(order.time.split(":")[0]);
        return orderHour >= startHour && orderHour < endHour;
      });
    }

    // Session filter (morning/afternoon/evening)
    if (filters.session) {
      result = result.filter((order) => {
        const orderHour = parseInt(order.time.split(":")[0]);
        if (filters.session === "morning")
          return orderHour >= 6 && orderHour < 12;
        if (filters.session === "afternoon")
          return orderHour >= 12 && orderHour < 17;
        if (filters.session === "evening")
          return orderHour >= 17 || orderHour < 6;
        return true;
      });
    }

    setFilteredOrders(sortOrders(result));
  }, [filters, orders]);

  // Sort orders with pending first, then by priority and queue position
  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      // Pending orders first
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;

      // Then by priority (higher first)
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // Then by queue position (older first)
      return (a.queuePosition || 0) - (b.queuePosition || 0);
    });
  };

  // Action buttons with tooltips
  const renderTooltip = (text) => (props) =>
    (
      <Tooltip id="button-tooltip" {...props}>
        {text}
      </Tooltip>
    );

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const setHighPriority = async (orderId) => {
    try {
      // Find the current highest priority
      const highestPriority = orders.reduce(
        (max, order) => Math.max(max, order.priority || 0),
        0
      );

      await updateDoc(doc(db, "orders", orderId), {
        priority: highestPriority + 1,
      });

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, priority: highestPriority + 1 }
            : order
        )
      );

      toast.success("Order priority increased");
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    }
  };

  // Prepare data for analysis charts
  const prepareChartData = () => {
    const statusCount = {};
    const hourCount = Array(24)
      .fill(0)
      .map((_, i) => ({ hour: i, count: 0 }));
    const sessionCount = {
      morning: 0,
      afternoon: 0,
      evening: 0,
    };
    let totalRevenue = 0;

    filteredOrders.forEach((order) => {
      // Status count
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;

      // Hourly distribution
      const hour = parseInt(order.time.split(":")[0]);
      hourCount[hour].count++;

      // Session distribution
      if (hour >= 6 && hour < 12) sessionCount.morning++;
      else if (hour >= 12 && hour < 17) sessionCount.afternoon++;
      else sessionCount.evening++;

      // Total revenue
      totalRevenue += parseFloat(order.total);
    });

    return {
      statusData: Object.entries(statusCount).map(([status, count]) => ({
        status,
        count,
      })),
      hourlyData: hourCount.filter((h) => h.count > 0),
      sessionData: Object.entries(sessionCount).map(([session, count]) => ({
        session,
        count,
      })),
      totalRevenue,
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Orders Management</h2>
        <div>
          <Button
            variant="info"
            className="me-2"
            onClick={() => setShowFilterModal(true)}
          >
            <FaFilter /> Filters
          </Button>
          <Button variant="primary" onClick={() => setShowAnalysisModal(true)}>
            <FaChartBar /> Analysis
          </Button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="alert alert-info">No orders found matching filters</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Roll Number</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                  }}
                  style={{ cursor: "pointer" }}
                  className={order.priority ? "table-warning" : ""}
                >
                  <td>{index + 1}</td>
                  <td>{order.orderId}</td>
                  <td>{order.rollNumber}</td>
                  <td>{order.items.length} items</td>
                  <td>₹{order.total}</td>
                  <td>
                    <Badge
                      bg={
                        order.status === "paid"
                          ? "success"
                          : order.status === "pending"
                          ? "warning"
                          : "primary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td>{order.time}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex gap-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip("Mark as Completed")}
                      >
                        <Button
                          size="sm"
                          variant="success"
                          disabled={order.status === "completed"}
                          onClick={() =>
                            updateOrderStatus(order.id, "completed")
                          }
                        >
                          <FaCheck />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip("Mark as Paid")}
                      >
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={order.status === "paid"}
                          onClick={() => updateOrderStatus(order.id, "paid")}
                        >
                          <FaMoneyBillWave />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip("Set High Priority")}
                      >
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => setHighPriority(order.id)}
                        >
                          <FaArrowUp />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p>
                    <strong>Order ID:</strong> {selectedOrder.orderId}
                  </p>
                  <p>
                    <strong>Roll Number:</strong> {selectedOrder.rollNumber}
                  </p>
                  <p>
                    <strong>Priority:</strong>{" "}
                    {selectedOrder.priority || "Normal"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Date:</strong> {selectedOrder.humanReadableDate}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedOrder.time}
                  </p>
                  <p>
                    <strong>Queue Position:</strong>{" "}
                    {selectedOrder.queuePosition}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p>
                  <strong>Status:</strong>
                  <Badge
                    bg={
                      selectedOrder.status === "paid"
                        ? "success"
                        : selectedOrder.status === "pending"
                        ? "warning"
                        : "primary"
                    }
                    className="ms-2"
                  >
                    {selectedOrder.status}
                  </Badge>
                </p>
                <p>
                  <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                </p>
              </div>

              <h5>Items</h5>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-end fw-bold fs-5">
                <p>Total: ₹{selectedOrder.total}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Orders</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date Range</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>
            </Form.Group>

            {/* <Form.Group className="mb-3">
              <Form.Label>Time Range</Form.Label>
              <Form.Select
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters({ ...filters, timeRange: e.target.value })
                }
              >
                <option value="">All Times</option>
                <option value="6-12">Morning (8AM-10A)</option>
                <option value="12-17">Afternoon (12PM-5PM)</option>
                <option value="17-24">Evening (5PM-12AM)</option>
              </Form.Select>
            </Form.Group> */}

            <Form.Group className="mb-3">
              <Form.Label>Session</Form.Label>
              <Form.Select
                value={filters.session}
                onChange={(e) =>
                  setFilters({ ...filters, session: e.target.value })
                }
              >
                <option value="">All Sessions</option>
                <option value="morning">Morning (8AM-11:45AM)</option>
                <option value="afternoon">Afternoon (11:45PM-2:30PM)</option>
                <option value="evening">Evening (2:30PM-5PM)</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({
                status: "",
                startDate: "",
                endDate: "",
                timeRange: "",
                session: "",
              });
              setShowFilterModal(false);
            }}
          >
            Clear Filters
          </Button>
          <Button variant="primary" onClick={() => setShowFilterModal(false)}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Analysis Modal */}
      <Modal
        show={showAnalysisModal}
        onHide={() => setShowAnalysisModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Orders Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6 mb-4">
              <h5>Status Distribution</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <h5>Hourly Distribution</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <h5>Session Distribution</h5>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column justify-content-center">
                  <h5 className="card-title text-center">Total Revenue</h5>
                  <h1 className="text-center text-primary">
                    ₹{chartData.totalRevenue.toFixed(2)}
                  </h1>
                  <p className="text-center text-muted">
                    from {filteredOrders.length} orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAnalysisModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrdersPage;

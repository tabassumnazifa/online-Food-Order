import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch both payments list and revenue summary at the same time
      const [paymentsRes, summaryRes] = await Promise.all([
        axios.get("http://localhost:5079/api/Admin/payments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5079/api/Admin/payments/revenue-summary", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPayments(paymentsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Admin Payments Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusText = (status) => {
    const map = { 
      1: "Pending", 2: "Paid", 3: "Failed", 4: "Cancelled",
      "Pending": "Pending", "Paid": "Paid", "Failed": "Failed", "Cancelled": "Cancelled"
    };
    return map[status] || status || "Unknown";
  };

  const getPaymentMethodText = (method) => {
    const map = { 
      1: "Online Payment", 2: "Cash on Delivery",
      "OnlinePayment": "Online Payment", "CashOnDelivery": "Cash on Delivery"
    };
    return map[method] || method || "Unknown";
  };

  const getStatusStyle = (statusText) => {
    if (statusText === "Paid") return { backgroundColor: "#d4edda", color: "#155724" };
    if (statusText === "Failed" || statusText === "Cancelled") return { backgroundColor: "#f8d7da", color: "#721c24" };
    if (statusText === "Pending") return { backgroundColor: "#fff3cd", color: "#856404" };
    return { backgroundColor: "#e2e3e5", color: "#383d41" };
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>💳 Payment Management</h1>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>💳 Payment Management</h1>
          <p>{error}</p>
          <button type="button" onClick={() => navigate("/admin/dashboard")}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ padding: "40px 20px", maxWidth: "1300px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", marginBottom: "30px" }}>
        <div>
          <h1>💳 Payment Management</h1>
          <p style={{ color: "#666" }}>View payment records and monitor system revenue.</p>
        </div>
        <button type="button" onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>
      </div>

      {/* Revenue Summary Cards */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div className="dashboard-card" style={{ textAlign: "center", borderLeft: "5px solid #28a745" }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>৳{summary.totalRevenue ?? 0}</p>
          </div>
          <div className="dashboard-card" style={{ textAlign: "center", borderLeft: "5px solid #007bff" }}>
            <h3>Successful</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#007bff" }}>{summary.successfulPayments ?? 0}</p>
          </div>
          <div className="dashboard-card" style={{ textAlign: "center", borderLeft: "5px solid #ffc107" }}>
            <h3>Pending</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffc107" }}>{summary.pendingPayments ?? 0}</p>
          </div>
          <div className="dashboard-card" style={{ textAlign: "center", borderLeft: "5px solid #dc3545" }}>
            <h3>Failed / Cancelled</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc3545" }}>{summary.failedPayments ?? 0}</p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="dashboard-card">
        <h2 style={{ marginBottom: "20px" }}>All Payment Records</h2>
        
        {payments.length === 0 ? (
          <p>No payment records found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Payment ID</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Order ID</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Customer</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Amount</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Method</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Status</th>
                  <th style={{ padding: "12px", borderBottom: "2px solid #dee2e6" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const statusText = getPaymentStatusText(payment.paymentStatus);
                  const methodText = getPaymentMethodText(payment.paymentMethod);
                  return (
                    <tr key={payment.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "12px" }}>#{payment.id}</td>
                      <td style={{ padding: "12px" }}>#{payment.orderId}</td>
                      <td style={{ padding: "12px" }}>{payment.customerName || "N/A"}</td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>৳{payment.amount}</td>
                      <td style={{ padding: "12px" }}>{methodText}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ ...getStatusStyle(statusText), padding: "6px 12px", borderRadius: "15px", fontWeight: "600", display: "inline-block" }}>
                          {statusText}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPayments;
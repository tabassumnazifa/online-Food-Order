import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5079/api/Admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Admin Dashboard:", response.data);
      setDashboard(response.data);
    } catch (error) {
      console.error("Admin Dashboard Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-loading-card">
          <div className="admin-loading-icon">⚙</div>
          <h2>Loading dashboard</h2>
          <p>Please wait while we load your system overview.</p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-error-card">
          <div className="admin-error-icon">!</div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={fetchDashboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     STATISTICS
  ========================= */

  const statistics = [
    {
      title: "Customers",
      value: dashboard?.totalCustomers ?? 0,
      description: "Registered customers",
      icon: "👥",
      className: "stat-green",
    },
    {
      title: "Restaurant Owners",
      value: dashboard?.totalRestaurantOwners ?? 0,
      description: "Registered owners",
      icon: "🏪",
      className: "stat-orange",
    },
    {
      title: "Delivery Riders",
      value: dashboard?.totalDeliveryRiders ?? 0,
      description: "Active rider accounts",
      icon: "🛵",
      className: "stat-blue",
    },
    {
      title: "Restaurants",
      value: dashboard?.totalRestaurants ?? 0,
      description: "Registered restaurants",
      icon: "🍽️",
      className: "stat-purple",
    },
    {
      title: "Food Items",
      value: dashboard?.totalFoods ?? 0,
      description: "Total food items",
      icon: "🍔",
      className: "stat-yellow",
    },
    {
      title: "Orders",
      value: dashboard?.totalOrders ?? 0,
      description: "Total system orders",
      icon: "📦",
      className: "stat-teal",
    },
    {
      title: "Revenue",
      value: `৳${dashboard?.totalRevenue ?? 0}`,
      description: "Total paid revenue",
      icon: "৳",
      className: "stat-revenue",
    },
  ];

  /* =========================
     MANAGEMENT
  ========================= */

  const managementItems = [
    {
      title: "Restaurant Management",
      description:
        "View, monitor and manage all registered restaurants.",
      icon: "🏪",
      button: "Manage Restaurants",
      path: "/admin/restaurants",
    },
    {
      title: "User Management",
      description:
        "Manage customers, restaurant owners and delivery riders.",
      icon: "👥",
      button: "Manage Users",
      path: "/admin/users",
    },
    {
      title: "Order Management",
      description:
        "Monitor and manage orders placed throughout the system.",
      icon: "📦",
      button: "Manage Orders",
      path: "/admin/orders",
    },
    {
      title: "Payment Management",
      description:
        "View payment records and monitor system revenue.",
      icon: "💳",
      button: "Manage Payments",
      path: "/admin/payments",
    },
    {
      title: "Super Offers",
      description:
        "Create and manage system-wide offers for customers.",
      icon: "🎁",
      button: "Manage Offers",
      path: "/admin/offers",
    },
  ];

  return (
    <div className="admin-dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="admin-dashboard-header">

        <div className="admin-header-content">

          <div>
            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h1>System Dashboard</h1>

            <p>
              Manage and monitor your entire food delivery
              platform from one place.
            </p>
          </div>

          <div className="admin-role-badge">
            <span className="admin-role-icon">🛡️</span>

            <div>
              <strong>Super Admin</strong>
              <small>Full system access</small>
            </div>
          </div>

        </div>

      </section>


      {/* =========================
          OVERVIEW
      ========================= */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>
            <span className="section-eyebrow">
              OVERVIEW
            </span>

            <h2>System Statistics</h2>
          </div>

          <span className="system-status">
            <span className="status-dot"></span>
            System Active
          </span>

        </div>


        <div className="admin-stat-grid">

          {statistics.map((stat) => (
            <div
              className={`admin-stat-card ${stat.className}`}
              key={stat.title}
            >

              <div className="stat-top">

                <div className="stat-icon">
                  {stat.icon}
                </div>

              </div>

              <div className="stat-content">

                <p>{stat.title}</p>

                <h3>{stat.value}</h3>

                <span>{stat.description}</span>

              </div>

            </div>
          ))}

        </div>

      </section>


      {/* =========================
          MANAGEMENT
      ========================= */}

      <section className="admin-section">

        <div className="admin-section-heading">

          <div>
            <span className="section-eyebrow">
              MANAGEMENT
            </span>

            <h2>System Management</h2>
          </div>

          <p className="section-description">
            Quick access to important administrative tools.
          </p>

        </div>


        <div className="admin-management-grid">

          {managementItems.map((item) => (
            <div
              className="admin-management-card"
              key={item.title}
            >

              <div className="management-card-top">

                <div className="management-icon">
                  {item.icon}
                </div>

                <span className="management-arrow">
                  →
                </span>

              </div>


              <div className="management-content">

                <h3>{item.title}</h3>

                <p>{item.description}</p>

              </div>


              <button
                type="button"
                className="management-btn"
                onClick={() => navigate(item.path)}
              >
                {item.button}

                <span>→</span>
              </button>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;

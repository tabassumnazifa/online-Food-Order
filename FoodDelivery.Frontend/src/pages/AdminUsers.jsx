
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminUsers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [riders, setRiders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [customersResponse, ownersResponse, ridersResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5079/api/Admin/customers",
            { headers }
          ),

          axios.get(
            "http://localhost:5079/api/Admin/restaurant-owners",
            { headers }
          ),

          axios.get(
            "http://localhost:5079/api/Admin/delivery-riders",
            { headers }
          ),
        ]);

      console.log("Customers:", customersResponse.data);
      console.log("Restaurant Owners:", ownersResponse.data);
      console.log("Delivery Riders:", ridersResponse.data);

      setCustomers(customersResponse.data);
      setOwners(ownersResponse.data);
      setRiders(ridersResponse.data);
    } catch (error) {
      console.error("Admin Users Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You are not authorized as an administrator.");
        return;
      }

      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, roleName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove this ${roleName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      let endpoint = "";

      if (roleName === "Customer") {
        endpoint = `http://localhost:5079/api/Admin/customers/${userId}`;
      }

      if (roleName === "Restaurant Owner") {
        endpoint = `http://localhost:5079/api/Admin/restaurant-owners/${userId}`;
      }

      if (roleName === "Delivery Rider") {
        endpoint = `http://localhost:5079/api/Admin/delivery-riders/${userId}`;
      }

      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(`${roleName} removed successfully.`);

      fetchUsers();
    } catch (error) {
      console.error("Delete User Error:", error);

      if (error.response?.status === 404) {
        alert("User not found.");
      } else {
        alert(
          error.response?.data?.message ||
            `Unable to remove this ${roleName}.`
        );
      }
    }
  };

  const renderUserCard = (user, roleName) => {
    return (
      <div
        className="dashboard-card"
        key={user.id}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3>
            {user.fullName || user.name || "Unnamed User"}
          </h3>

          <p>
            <strong>Email:</strong>{" "}
            {user.email || "N/A"}
          </p>

          <p>
            <strong>Role:</strong> {roleName}
          </p>

          {user.phone && (
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => deleteUser(user.id, roleName)}
          style={{
            marginTop: "15px",
            backgroundColor: "#dc3545",
            color: "white",
          }}
        >
          🗑️ Remove
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>👥 User Management</h1>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <h1>👥 User Management</h1>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-page"
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1>👥 User Management</h1>

          <p style={{ color: "#666" }}>
            Manage customers, restaurant owners and delivery riders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Customers */}

      <section style={{ marginBottom: "40px" }}>
        <h2>👤 Customers ({customers.length})</h2>

        {customers.length === 0 ? (
          <div className="dashboard-card">
            <p>No customers found.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {customers.map((user) =>
              renderUserCard(user, "Customer")
            )}
          </div>
        )}
      </section>

      {/* Restaurant Owners */}

      <section style={{ marginBottom: "40px" }}>
        <h2>🏪 Restaurant Owners ({owners.length})</h2>

        {owners.length === 0 ? (
          <div className="dashboard-card">
            <p>No restaurant owners found.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {owners.map((user) =>
              renderUserCard(user, "Restaurant Owner")
            )}
          </div>
        )}
      </section>

      {/* Delivery Riders */}

      <section>
        <h2>🛵 Delivery Riders ({riders.length})</h2>

        {riders.length === 0 ? (
          <div className="dashboard-card">
            <p>No delivery riders found.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {riders.map((user) =>
              renderUserCard(user, "Delivery Rider")
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminUsers;


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

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        customersResponse,
        ownersResponse,
        ridersResponse,
      ] = await Promise.all([
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

      console.log(
        "Customers:",
        customersResponse.data
      );

      console.log(
        "Restaurant Owners:",
        ownersResponse.data
      );

      console.log(
        "Delivery Riders:",
        ridersResponse.data
      );

      setCustomers(customersResponse.data);
      setOwners(ownersResponse.data);
      setRiders(ridersResponse.data);

    } catch (error) {
      console.error(
        "Admin Users Error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (error.response?.status === 403) {
        setError(
          "You are not authorized as an administrator."
        );
        return;
      }

      setError("Failed to load users.");

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // BLOCK / UNBLOCK USER
  // =====================================================

  const changeUserStatus = async (
    userId,
    roleName,
    isActive
  ) => {
    const action = isActive
      ? "block"
      : "unblock";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this ${roleName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      let endpoint = "";

      if (roleName === "Customer") {
        endpoint =
          `http://localhost:5079/api/Admin/customers/${userId}/${action}`;
      }

      if (roleName === "Restaurant Owner") {
        endpoint =
          `http://localhost:5079/api/Admin/restaurant-owners/${userId}/${action}`;
      }

      if (roleName === "Delivery Rider") {
        endpoint =
          `http://localhost:5079/api/Admin/delivery-riders/${userId}/${action}`;
      }

      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        `${roleName} ${
          action === "block"
            ? "blocked"
            : "unblocked"
        } successfully.`
      );

      await fetchUsers();

    } catch (error) {
      console.error(
        "Change User Status Error:",
        error
      );

      if (error.response?.status === 404) {
        alert("User not found.");
        return;
      }

      if (error.response?.status === 400) {
        alert(
          error.response.data ||
            `Unable to ${action} this ${roleName}.`
        );
        return;
      }

      alert(
        `Failed to ${action} this ${roleName}.`
      );
    }
  };


  // =====================================================
  // USER CARD
  // =====================================================

  const renderUserCard = (
    user,
    roleName
  ) => {
    const isActive = user.isActive;

    return (
      <div
        className="dashboard-card"
        key={user.id}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: isActive
            ? "1px solid #ddd"
            : "2px solid #dc3545",
        }}
      >

        <div>

          {/* NAME + STATUS */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {user.fullName ||
                user.name ||
                "Unnamed User"}
            </h3>

            <span
              style={{
                padding: "5px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor: isActive
                  ? "#d1e7dd"
                  : "#f8d7da",
                color: isActive
                  ? "#0f5132"
                  : "#842029",
                whiteSpace: "nowrap",
              }}
            >
              {isActive
                ? "🟢 Active"
                : "🔴 Blocked"}
            </span>
          </div>


          {/* EMAIL */}

          <p>
            <strong>Email:</strong>{" "}
            {user.email || "N/A"}
          </p>


          {/* ROLE */}

          <p>
            <strong>Role:</strong>{" "}
            {roleName}
          </p>


          {/* PHONE */}

          {user.phoneNumber && (
            <p>
              <strong>Phone:</strong>{" "}
              {user.phoneNumber}
            </p>
          )}

        </div>


        {/* ACTION BUTTON */}

        <button
          type="button"
          onClick={() =>
            changeUserStatus(
              user.id,
              roleName,
              isActive
            )
          }
          style={{
            marginTop: "15px",
            width: "100%",
            backgroundColor: isActive
              ? "#dc3545"
              : "#198754",
            color: "white",
          }}
        >
          {isActive
            ? "🚫 Block User"
            : "🔓 Unblock User"}
        </button>

      </div>
    );
  };


  // =====================================================
  // USER COUNTS
  // =====================================================

  const allUsers = [
    ...customers,
    ...owners,
    ...riders,
  ];

  const totalUsers = allUsers.length;

  const activeUsers = allUsers.filter(
    (user) => user.isActive
  ).length;

  const blockedUsers = allUsers.filter(
    (user) => !user.isActive
  ).length;


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">

          <h1>
            👥 User Management
          </h1>

          <p>
            Loading users...
          </p>

        </div>
      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">

          <h1>
            👥 User Management
          </h1>

          <p
            style={{
              color: "#dc3545",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>
      </div>
    );
  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div
      className="dashboard-page"
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

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

          <h1>
            👥 User Management
          </h1>

          <p
            style={{
              color: "#666",
            }}
          >
            Manage customers, restaurant owners
            and delivery riders.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate("/admin/dashboard")
          }
        >
          ← Dashboard
        </button>

      </div>


      {/* =================================================
          USER OVERVIEW
      ================================================= */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "30px",
        }}
      >

        <h2>
          📊 User Overview
        </h2>

        <div
          style={{
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
            marginTop: "15px",
          }}
        >

          <p>
            <strong>
              Total Users:
            </strong>{" "}
            {totalUsers}
          </p>

          <p
            style={{
              color: "#198754",
            }}
          >
            <strong>
              Active:
            </strong>{" "}
            {activeUsers}
          </p>

          <p
            style={{
              color: "#dc3545",
            }}
          >
            <strong>
              Blocked:
            </strong>{" "}
            {blockedUsers}
          </p>

        </div>

      </div>


      {/* =================================================
          CUSTOMERS
      ================================================= */}

      <section
        style={{
          marginBottom: "40px",
        }}
      >

        <h2>
          👤 Customers ({customers.length})
        </h2>

        {customers.length === 0 ? (
          <div className="dashboard-card">

            <p>
              No customers found.
            </p>

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
              renderUserCard(
                user,
                "Customer"
              )
            )}

          </div>
        )}

      </section>


      {/* =================================================
          RESTAURANT OWNERS
      ================================================= */}

      <section
        style={{
          marginBottom: "40px",
        }}
      >

        <h2>
          🏪 Restaurant Owners ({owners.length})
        </h2>

        {owners.length === 0 ? (
          <div className="dashboard-card">

            <p>
              No restaurant owners found.
            </p>

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
              renderUserCard(
                user,
                "Restaurant Owner"
              )
            )}

          </div>
        )}

      </section>


      {/* =================================================
          DELIVERY RIDERS
      ================================================= */}

      <section>

        <h2>
          🛵 Delivery Riders ({riders.length})
        </h2>

        {riders.length === 0 ? (
          <div className="dashboard-card">

            <p>
              No delivery riders found.
            </p>

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
              renderUserCard(
                user,
                "Delivery Rider"
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default AdminUsers;

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);

  let role = null;

  // =========================
  // GET ROLE FROM JWT
  // =========================
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      console.log("Logged-in user role:", role);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }

  // =========================
  // NOTIFICATION BELL LOGIC (Admin Only)
  // =========================
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (token && role === "Admin") {
        try {
          const response = await axios.get(
            "http://localhost:5079/api/Notifications/unread-count",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error("Failed to fetch notification count", error);
        }
      }
    };

    fetchUnreadCount();
    // Refresh the count every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000); 
    return () => clearInterval(interval);
  }, [token, role]);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      {/* =========================
          LOGO
      ========================= */}
      <h2 className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        🍔 Food Delivery
      </h2>

      {/* =========================
          NAVIGATION LINKS
      ========================= */}
      <div className="nav-links">
        {/* =========================
            COMMON PAGES
        ========================= */}
        <NavLink to="/">Home</NavLink>
        <NavLink to="/restaurants">Restaurants</NavLink>

        {/* =========================
            GUEST
        ========================= */}
        {!token && (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}

        {/* =========================
            CUSTOMER
        ========================= */}
        {token && role === "Customer" && (
          <>
            <NavLink to="/cart">🛒 Cart</NavLink>
            <NavLink to="/orders">🧾 My Orders</NavLink>
            <NavLink to="/feedback">⭐ Feedback</NavLink>
            <NavLink to="/offers">🎁 Offers</NavLink>
          </>
        )}

        {/* =========================
            RESTAURANT OWNER
        ========================= */}
        {token && role === "RestaurantOwner" && (
          <>
            <NavLink to="/restaurant/dashboard">Dashboard</NavLink>
            <NavLink to="/restaurant/foods">Foods</NavLink>
            <NavLink to="/restaurant/orders">Orders</NavLink>
          </>
        )}

        {/* =========================
            ADMIN
        ========================= */}
        {token && role === "Admin" && (
          <>
            <NavLink to="/admin/dashboard">Admin</NavLink>
            
            {/* ✅ NOTIFICATION BELL */}
            <button 
              onClick={() => navigate("/admin/notifications")} 
              style={{
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                position: "relative", 
                fontSize: "22px", 
                marginLeft: "10px",
                marginRight: "10px",
                padding: "5px"
              }}
              title="View Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", 
                  top: "-2px", 
                  right: "-5px", 
                  backgroundColor: "#ef4444", 
                  color: "white", 
                  borderRadius: "50%", 
                  padding: "2px 6px", 
                  fontSize: "11px", 
                  fontWeight: "bold",
                  border: "1.5px solid white"
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </>
        )}

        {/* =========================
            DELIVERY RIDER
        ========================= */}
        {token && role === "DeliveryRider" && (
          <>
            <NavLink to="/rider/dashboard">Dashboard</NavLink>
            <NavLink to="/rider/available-orders">Available Orders</NavLink>
          </>
        )}

        {/* =========================
            LOGOUT
        ========================= */}
        {token && (
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
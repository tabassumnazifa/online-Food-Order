import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let role = null;

  // =========================
  // GET ROLE FROM JWT
  // =========================
  if (token) {
    try {
      const decoded = jwtDecode(token);

      role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      console.log("Logged-in user role:", role);
    } catch (error) {
      console.error("Invalid token:", error);

      localStorage.removeItem("token");
    }
  }

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

      {/* ========================= */}
      {/* LOGO */}
      {/* ========================= */}

      <h2 className="logo">
        🍔 Food Delivery
      </h2>


      {/* ========================= */}
      {/* NAVIGATION LINKS */}
      {/* ========================= */}

      <div className="nav-links">

        {/* ========================= */}
        {/* COMMON PAGES */}
        {/* ========================= */}

        <NavLink to="/">
          Home
        </NavLink>

        <NavLink to="/restaurants">
          Restaurants
        </NavLink>


        {/* ========================= */}
        {/* GUEST */}
        {/* ========================= */}

        {!token && (
          <>
            <NavLink to="/login">
              Login
            </NavLink>

            <NavLink to="/register">
              Register
            </NavLink>
          </>
        )}


        {/* ========================= */}
        {/* CUSTOMER */}
        {/* ========================= */}

        {token && role === "Customer" && (
          <>
            <NavLink to="/cart">
              🛒 Cart
            </NavLink>

            <NavLink to="/orders">
              🧾 My Orders
            </NavLink>
          </>
        )}


        {/* ========================= */}
        {/* RESTAURANT OWNER */}
        {/* ========================= */}

        {token && role === "RestaurantOwner" && (
          <NavLink to="/restaurant/dashboard">
            Dashboard
          </NavLink>
        )}


        {/* ========================= */}
        {/* ADMIN */}
        {/* ========================= */}

        {token && role === "Admin" && (
          <NavLink to="/admin/dashboard">
            Admin
          </NavLink>
        )}


        {/* ========================= */}
        {/* RIDER */}
        {/* ========================= */}

        {token && role === "Rider" && (
          <NavLink to="/rider/dashboard">
            Rider
          </NavLink>
        )}


        {/* ========================= */}
        {/* LOGOUT */}
        {/* ========================= */}

        {token && (
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
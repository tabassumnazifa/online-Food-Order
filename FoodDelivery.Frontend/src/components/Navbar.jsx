import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let role = null;

  // Get role from JWT
  if (token) {
    try {
      const decoded = jwtDecode(token);

      role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

    } catch (error) {
      console.error("Invalid token:", error);

      localStorage.removeItem("token");
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");

    window.location.reload();
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <h2 className="logo">
        🍔 Food Delivery
      </h2>


      {/* Navigation */}
      <div className="nav-links">

        {/* Common Pages */}
        <NavLink to="/">
          Home
        </NavLink>

        <NavLink to="/restaurants">
          Restaurants
        </NavLink>


        {/* ========================= */}
        {/* Guest */}
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
        {/* Customer */}
        {/* ========================= */}

        {token && role === "Customer" && (
          <NavLink to="/cart">
            🛒 Cart
          </NavLink>
        )}


        {/* ========================= */}
        {/* Restaurant Owner */}
        {/* ========================= */}

        {token && role === "RestaurantOwner" && (
          <NavLink to="/restaurant/dashboard">
            Dashboard
          </NavLink>
        )}


        {/* ========================= */}
        {/* Admin */}
        {/* ========================= */}

        {token && role === "Admin" && (
          <NavLink to="/admin/dashboard">
            Admin
          </NavLink>
        )}


        {/* ========================= */}
        {/* Rider */}
        {/* ========================= */}

        {token && role === "Rider" && (
          <NavLink to="/rider/dashboard">
            Rider
          </NavLink>
        )}


        {/* ========================= */}
        {/* Logout */}
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
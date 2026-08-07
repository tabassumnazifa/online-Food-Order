import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let role = null;

  if (token) {
    try {

      const decoded = jwtDecode(token);

      role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    } catch {
      localStorage.removeItem("token");
    }
  }


  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/");

    window.location.reload();

  };


  return (

    <nav className="navbar">

      <h2 className="logo">
        🍔 Food Delivery
      </h2>


      <div className="nav-links">

        <NavLink to="/">
          Home
        </NavLink>

        <NavLink to="/restaurants">
          Restaurants
        </NavLink>


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


        {token && role === "RestaurantOwner" && (
          <NavLink to="/restaurant/dashboard">
            Dashboard
          </NavLink>
        )}


        {token && role === "Customer" && (
          <NavLink to="/cart">
            Cart
          </NavLink>
        )}


        {token && role === "Admin" && (
          <NavLink to="/admin/dashboard">
            Admin
          </NavLink>
        )}


        {token && role === "Rider" && (
          <NavLink to="/rider/dashboard">
            Rider
          </NavLink>
        )}


        {token && (
          <button
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
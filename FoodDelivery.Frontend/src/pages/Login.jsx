import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // LOGIN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5079/api/Auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      console.log("Login response:", response.data);

      const token = response.data.token;

      if (!token) {
        alert("Login failed: token was not received.");
        return;
      }

      // =========================
      // SAVE TOKEN
      // =========================

      localStorage.setItem("token", token);

      // =========================
      // DECODE JWT
      // =========================

      const decoded = jwtDecode(token);

      console.log("Decoded JWT:", decoded);

      // ASP.NET Core Role claim
      const roleClaim =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      // Backend also returns role directly
      const role =
        response.data.role || roleClaim;

      console.log("Logged in role:", role);

      if (!role) {
        alert(
          "Login successful, but no role was found for this account."
        );

        localStorage.removeItem("token");
        return;
      }

      // =========================
      // ROLE-BASED REDIRECTION
      // =========================

      if (role === "Admin") {
        navigate("/admin/dashboard");
      }

      else if (role === "RestaurantOwner") {
        navigate("/restaurant/dashboard");
      }

      else if (role === "DeliveryRider") {
        navigate("/rider/dashboard");
      }

      else if (role === "Customer") {
        navigate("/");
      }

      else {
        alert(`Unknown role: ${role}`);
        navigate("/");
      }

    } catch (error) {
      console.error("Login Error:", error);

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      let message =
        "Invalid email or password.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      }

      else if (error.response?.data?.message) {
        message =
          error.response.data.message;
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="login-header">

          <h1>
            🍔 Food Delivery
          </h1>

          <p>
            Login to your account
          </p>

        </div>


        {/* ========================= */}
        {/* LOGIN FORM */}
        {/* ========================= */}

        <form
          onSubmit={handleSubmit}
          className="login-form"
          autoComplete="off"
        >

          {/* Email */}

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />


          {/* Password */}

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />


          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* ========================= */}
        {/* REGISTER LINK */}
        {/* ========================= */}

        <div className="login-footer">

          <p>
            Don't have an account?{" "}

            <Link to="/register">
              Create Account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
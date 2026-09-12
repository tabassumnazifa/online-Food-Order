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

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

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

      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);

      console.log("Decoded JWT:", decoded);

      const roleClaim =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      const role = response.data.role || roleClaim;

      console.log("Logged in role:", role);

      if (!role) {
        alert(
          "Login successful, but no role was found for this account."
        );

        localStorage.removeItem("token");
        return;
      }

      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "RestaurantOwner") {
        navigate("/restaurant/dashboard");
      } else if (role === "DeliveryRider") {
        navigate("/rider/dashboard");
      } else if (role === "Customer") {
        navigate("/");
      } else {
        alert(`Unknown role: ${role}`);
        navigate("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);

      let message = "Invalid email or password.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">

        {/* LEFT BRAND PANEL */}
        <section className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-logo">
              <span>🍴</span>

              <strong>
                Food<span>Delivery</span>
              </strong>
            </div>

            <span className="auth-brand-badge">
              FOOD DELIVERY
            </span>

            <h1>
              Your favorite food,
              <br />
              <span>just a few clicks away.</span>
            </h1>

            <p className="auth-brand-description">
              Discover restaurants, explore delicious meals and
              enjoy convenient food delivery from one place.
            </p>

            <div className="auth-features">

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  🍽️
                </div>

                <div>
                  <strong>Great food choices</strong>

                  <small>
                    Explore a variety of restaurants and meals.
                  </small>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  ⚡
                </div>

                <div>
                  <strong>Fast & convenient</strong>

                  <small>
                    Order your favorite food without the hassle.
                  </small>
                </div>
              </div>

              <div className="auth-feature">
                <div className="auth-feature-icon">
                  🔒
                </div>

                <div>
                  <strong>Secure experience</strong>

                  <small>
                    Your account and orders stay protected.
                  </small>
                </div>
              </div>

            </div>

            <div className="auth-brand-footer">
              <span>Fresh meals</span>
              <span>•</span>
              <span>Easy ordering</span>
              <span>•</span>
              <span>Happy customers</span>
            </div>

          </div>

          <div className="auth-decoration auth-decoration-one"></div>
          <div className="auth-decoration auth-decoration-two"></div>
          <div className="auth-decoration auth-decoration-three"></div>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="auth-form-panel">
          <div className="auth-card">

            <div className="auth-header">

              <div className="auth-logo">
                🍔
              </div>

              <span className="auth-eyebrow">
                WELCOME BACK
              </span>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Enter your details to continue ordering.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="auth-form"
              autoComplete="off"
            >

              {/* EMAIL */}
              <div className="auth-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div className="auth-field">

                <div className="auth-label-row">
                  <label htmlFor="password">
                    Password
                  </label>
                </div>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    🔒
                  </span>

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

                </div>

              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In

                    <span className="auth-submit-arrow">
                      →
                    </span>
                  </>
                )}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="auth-divider">
              <span></span>
              <small>OR</small>
              <span></span>
            </div>

            {/* REGISTER */}
            <div className="auth-register">

              <p>
                Don't have an account?
              </p>

              <Link to="/register">
                Create a new account
                <span>→</span>
              </Link>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Login;


 
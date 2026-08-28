
import "./App.css";

import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// =========================
// Customer Pages
// =========================

import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import RestaurantMenu from "./pages/RestaurantMenu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

// =========================
// Authentication
// =========================

import Login from "./pages/Login";
import Register from "./pages/Register";

// =========================
// Restaurant Owner Pages
// =========================

import CreateRestaurant from "./pages/CreateRestaurant";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import ManageFoods from "./pages/ManageFoods";
import RestaurantOrders from "./pages/RestaurantOrders";

// =========================
// Rider Pages
// =========================

import RiderDashboard from "./pages/RiderDashboard";

// =========================
// App
// =========================

function App() {
  return (
    <>
      <Navbar />

      <main className="main-content">
        <Routes>

          {/* ========================= */}
          {/* Customer Pages */}
          {/* ========================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/restaurants"
            element={<Restaurants />}
          />

          <Route
            path="/restaurant/:id"
            element={<RestaurantMenu />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />


          {/* ========================= */}
          {/* Authentication */}
          {/* ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* ========================= */}
          {/* Restaurant Owner */}
          {/* ========================= */}

          <Route
            path="/restaurant/create"
            element={<CreateRestaurant />}
          />

          <Route
            path="/restaurant/dashboard"
            element={<RestaurantDashboard />}
          />

          <Route
            path="/restaurant/foods"
            element={<ManageFoods />}
          />

          <Route
            path="/restaurant/orders"
            element={<RestaurantOrders />}
          />


          {/* ========================= */}
          {/* Rider */}
          {/* ========================= */}

          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />

        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;


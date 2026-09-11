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
import Feedback from "./pages/Feedback";
import Offers from "./pages/Offers";

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
import CreateOffer from "./pages/CreateOffer";

// =========================
// Rider Pages
// =========================

import RiderDashboard from "./pages/RiderDashboard";
import AvailableOrders from "./pages/AvailableOrders";

// =========================
// Admin Pages
// =========================

import AdminDashboard from "./pages/AdminDashboard";
import AdminRestaurants from "./pages/AdminRestaurants";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminOffers from "./pages/AdminOffers";

// =========================
// App
// =========================

function App() {
  return (
    <>
      <Navbar />

      <main className="main-content">
        <Routes>

          {/* =========================
              Customer Pages
          ========================= */}

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

          <Route
            path="/feedback"
            element={<Feedback />}
          />

          <Route
            path="/offers"
            element={<Offers />}
          />

          {/* =========================
              Authentication
          ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              Restaurant Owner
          ========================= */}

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

          <Route
            path="/restaurant/offers/create"
            element={<CreateOffer />}
          />

          {/* =========================
              Rider
          ========================= */}

          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />

          <Route
            path="/rider/available-orders"
            element={<AvailableOrders />}
          />

          {/* =========================
              Super Admin
          ========================= */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/restaurants"
            element={<AdminRestaurants />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/offers"
            element={<AdminOffers />}
          />

        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;

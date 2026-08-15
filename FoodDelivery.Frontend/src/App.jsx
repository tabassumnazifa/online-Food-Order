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
import CreateRestaurant from "./pages/CreateRestaurant";
import RestaurantOrders from "./pages/RestaurantOrders";

// =========================
// Authentication
// =========================
import Login from "./pages/Login";
import Register from "./pages/Register";

// =========================
// Restaurant Owner Pages
// =========================
import RestaurantDashboard from "./pages/RestaurantDashboard";
import ManageFoods from "./pages/ManageFoods";

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

          <Route
             path="/restaurant/orders"
             element={<RestaurantOrders />}
          />


          {/* ========================= */}
          {/* Restaurant Owner */}
          {/* ========================= */}

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
            path="/restaurant/create"
            element={<CreateRestaurant />}
          />


          {/* ========================= */}
          {/* Future Admin */}
          {/* ========================= */}

          {/*
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
          */}


          {/* ========================= */}
          {/* Future Rider */}
          {/* ========================= */}

          {/*
          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />
          */}

        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
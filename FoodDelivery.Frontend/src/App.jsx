import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Customer Pages
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import RestaurantMenu from "./pages/RestaurantMenu";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";

// Restaurant Owner Pages
import RestaurantDashboard from "./pages/RestaurantDashboard";
import ManageFoods from "./pages/ManageFoods";

// Future Pages
// import AdminDashboard from "./pages/AdminDashboard";
// import RiderDashboard from "./pages/RiderDashboard";

function App() {
  return (
    <>
      <Navbar />

      <main className="main-content">
        <Routes>

          {/* ========================= */}
          {/* Customer */}
          {/* ========================= */}

          <Route path="/" element={<Home />} />

          <Route
            path="/restaurants"
            element={<Restaurants />}
          />

          <Route
            path="/restaurant/:id"
            element={<RestaurantMenu />}
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
            path="/restaurant/dashboard"
            element={<RestaurantDashboard />}
          />

          <Route
            path="/restaurant/foods"
            element={<ManageFoods />}
          />



          {/* ========================= */}
          {/* Admin (Later) */}
          {/* ========================= */}

          {/*
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
          */}



          {/* ========================= */}
          {/* Rider (Later) */}
          {/* ========================= */}

          {/*
          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />
          */}



          {/* ========================= */}
          {/* 404 Page (Optional Later) */}
          {/* ========================= */}

          {/*
          <Route
            path="*"
            element={<NotFound />}
          />
          */}

        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
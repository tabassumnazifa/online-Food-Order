import "./App.css";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Restaurants from "./pages/Restaurants";
import RestaurantMenu from "./pages/RestaurantMenu";

// Dashboards (create these pages if not created yet)
import RestaurantDashboard from "./pages/RestaurantDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import RiderDashboard from "./pages/RiderDashboard";


function App() {

  return (

    <>

      <Navbar />


      <main className="main-content">

        <Routes>


          {/* Customer Pages */}
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



          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />


          <Route
            path="/register"
            element={<Register />}
          />



          {/* Restaurant Owner */}
          <Route
            path="/restaurant/dashboard"
            element={<RestaurantDashboard />}
          />



          {/* Later add */}
          {/* 
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />


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
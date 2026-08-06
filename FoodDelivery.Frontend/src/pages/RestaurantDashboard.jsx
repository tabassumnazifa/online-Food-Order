import { useEffect, useState } from "react";
import axios from "axios";

function RestaurantDashboard() {

  const [dashboard, setDashboard] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const token = localStorage.getItem("token");


  useEffect(() => {

    fetchDashboard();
    fetchRestaurant();

  }, []);



  const fetchDashboard = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/dashboard",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setDashboard(response.data);

    }
    catch(error){

      console.log(error);

    }

  };



  const fetchRestaurant = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5079/api/Restaurant/my-restaurant",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setRestaurant(response.data);

    }
    catch(error){

      console.log(error);

    }

  };



  return (

    <div className="dashboard-page">


      <h1>
        🍔 Restaurant Owner Dashboard
      </h1>



      {
        restaurant &&

        <div className="dashboard-card">

          <h2>
            {restaurant.name}
          </h2>

          <p>
            {restaurant.description}
          </p>

          <p>
            📍 {restaurant.address}
          </p>

          <p>
            📞 {restaurant.phone}
          </p>


        </div>

      }



      {
        dashboard &&

        <div className="dashboard-card">

          <h2>
            Statistics
          </h2>


          <p>
            Total Foods: {dashboard.totalFoods}
          </p>


          <p>
            Total Orders: {dashboard.totalOrders}
          </p>


          <p>
            Revenue: {dashboard.totalRevenue}
          </p>


        </div>

      }



      <div className="dashboard-buttons">


        <button>
          Manage Foods
        </button>


        <button>
          Add Food
        </button>


        <button>
          View Orders
        </button>


      </div>



    </div>

  );

}


export default RestaurantDashboard;
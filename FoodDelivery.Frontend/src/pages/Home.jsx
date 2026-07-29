import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>🍔 Welcome to Food Delivery</h1>
      <p>Order your favorite meals from the best restaurants near you.</p>

      <button onClick={() => navigate("/restaurants")}>
        Order Now
      </button>
    </div>
  );
}

export default Home;
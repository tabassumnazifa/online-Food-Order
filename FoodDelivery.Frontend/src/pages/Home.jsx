import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            FRESH FOOD · FAST DELIVERY
          </span>

          <h1>
            Good food,
            <br />
            <span>good mood.</span>
          </h1>

          <p>
            Discover delicious meals from your favorite restaurants
            and get them delivered right to your doorstep.
          </p>

          <div className="home-actions">
            <button
              type="button"
              className="home-primary-btn"
              onClick={() => navigate("/restaurants")}
            >
              Explore Restaurants
              <span>→</span>
            </button>

            <button
              type="button"
              className="home-secondary-btn"
              onClick={() => navigate("/restaurants")}
            >
              View Menu
            </button>
          </div>

          <div className="home-highlights">
            <div className="home-highlight">
              <span className="highlight-icon">🍽️</span>
              <div>
                <strong>Great Choices</strong>
                <small>Multiple restaurants</small>
              </div>
            </div>

            <div className="home-highlight">
              <span className="highlight-icon">⚡</span>
              <div>
                <strong>Quick Delivery</strong>
                <small>Fresh & fast</small>
              </div>
            </div>

            <div className="home-highlight">
              <span className="highlight-icon">🔒</span>
              <div>
                <strong>Secure Checkout</strong>
                <small>Safe payments</small>
              </div>
            </div>
          </div>
        </div>

        <div className="home-visual">
          <div className="home-food-card">
            <div className="food-card-glow"></div>

            <div className="food-emoji">🍔</div>

            <div className="food-card-content">
              <span>Today's craving</span>
              <h3>Something delicious</h3>
              <p>Choose your favorite meal.</p>
            </div>

            <div className="food-card-badge">
              <span>★</span>
              Loved by customers
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <span>🚴</span>
            <div>
              <strong>Fast delivery</strong>
              <small>To your doorstep</small>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <span>⭐</span>
            <div>
              <strong>Fresh & tasty</strong>
              <small>Made with care</small>
            </div>
          </div>
        </div>
      </section>

      <section className="home-bottom-section">
        <div>
          <span className="home-section-eyebrow">WHY CHOOSE US</span>
          <h2>Everything you need for a better meal.</h2>
        </div>

        <button
          type="button"
          className="home-text-btn"
          onClick={() => navigate("/restaurants")}
        >
          Start exploring
          <span>→</span>
        </button>
      </section>
    </main>
  );
}

export default Home;


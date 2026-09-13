import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isSuccess = path === "/payment/success";
  const isFailed = path === "/payment/fail";
  const isCancelled = path === "/payment/cancel";

  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to orders after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Dynamic configuration based on the payment result
  let config = {
    icon: "✅",
    bgColor: "#d4edda",
    borderColor: "#28a745",
    textColor: "#155724",
    title: "Payment Successful!",
    message: "Your order has been placed and paid for successfully. The restaurant is now preparing your delicious food!",
    btnText: "View My Orders"
  };

  if (isFailed) {
    config = {
      icon: "❌",
      bgColor: "#f8d7da",
      borderColor: "#dc3545",
      textColor: "#721c24",
      title: "Payment Failed",
      message: "Unfortunately, your transaction could not be completed. Please check your bank details or try again.",
      btnText: "Go to My Orders"
    };
  } else if (isCancelled) {
    config = {
      icon: "⚠️",
      bgColor: "#fff3cd",
      borderColor: "#ffc107",
      textColor: "#856404",
      title: "Payment Cancelled",
      message: "You cancelled the payment process. Your cart items are still saved if you want to try again later.",
      btnText: "Go to My Orders"
    };
  }

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f8f9fa" }}>
      <div style={{ 
        maxWidth: "500px", 
        width: "100%", 
        backgroundColor: "white", 
        borderRadius: "20px", 
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)", 
        overflow: "hidden",
        textAlign: "center"
      }}>
        
        {/* HEADER BANNER */}
        <div style={{ 
          backgroundColor: config.bgColor, 
          padding: "40px 20px", 
          borderBottom: `4px solid ${config.borderColor}` 
        }}>
          <div style={{ fontSize: "5rem", marginBottom: "10px", lineHeight: 1 }}>
            {config.icon}
          </div>
          <h1 style={{ margin: 0, color: config.textColor, fontSize: "2rem" }}>
            {config.title}
          </h1>
        </div>

        {/* BODY CONTENT */}
        <div style={{ padding: "30px" }}>
          <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "25px" }}>
            {config.message}
          </p>

          <button 
            onClick={() => navigate("/orders")}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: config.borderColor,
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "transform 0.1s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >
            {config.btnText} →
          </button>

          <button 
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              backgroundColor: "transparent",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Back to Home
          </button>

          <p style={{ marginTop: "20px", color: "#999", fontSize: "0.9rem" }}>
            Auto-redirecting in <strong style={{ color: "#333" }}>{countdown}</strong> seconds...
          </p>
        </div>
      </div>
    </main>
  );
}

export default PaymentResult;
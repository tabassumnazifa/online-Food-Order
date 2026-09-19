import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const formRef = useRef(null);

  // Check if we are in the "Intermediate Redirect" phase (has payment data from Checkout)
  const paymentData = location.state?.paymentData;
  const isRedirecting = !!paymentData;

  // Check if we are in the "Final Result" phase
  const isSuccess = path === "/payment/success";
  const isFailed = path === "/payment/fail";
  const isCancelled = path === "/payment/cancel";
  const isFinalResult = isSuccess || isFailed || isCancelled;

  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to orders after 5 seconds (ONLY for final results)
  useEffect(() => {
    if (isFinalResult) {
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
    }
  }, [isFinalResult, navigate]);

  // Auto-submit form to SSLCommerz (ONLY for intermediate redirect)
  useEffect(() => {
    if (isRedirecting && paymentData?.paymentUrl) {
      const timer = setTimeout(() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isRedirecting, paymentData]);

  // ==========================================
  // RENDER 1: INTERMEDIATE REDIRECT (Loading & Auto-submit)
  // ==========================================
  if (isRedirecting) {
    const { paymentUrl, payload, transactionId } = paymentData;
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔒 Secure Payment Gateway</h2>
          <p style={styles.subtitle}>You are being redirected to complete your payment securely.</p>
          <div style={styles.badge}>🛡️ SSLCommerz Secured Payment</div>
          <div style={styles.summary}>
            <div style={styles.row}><span>Transaction ID:</span><span style={styles.mono}>{transactionId}</span></div>
            {payload && (
              <>
                <div style={styles.row}><span>Customer:</span><span>{payload.cus_name}</span></div>
                <div style={styles.row}><span>Total Amount:</span><span style={styles.amount}>৳{payload.total_amount}</span></div>
              </>
            )}
          </div>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Redirecting to payment gateway...</p>
          <p style={styles.warning}>Please do not close this window.</p>

          {paymentUrl && (
            <form ref={formRef} action={paymentUrl} method="POST" style={{ display: "none" }}>
              {payload && Object.entries(payload).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: FINAL RESULT (Success / Fail / Cancel)
  // ==========================================
  let config = {
    icon: "✅", bgColor: "#d4edda", borderColor: "#28a745", textColor: "#155724",
    title: "Payment Successful!",
    message: "Your order has been placed and paid for successfully. The restaurant is now preparing your delicious food!",
    btnText: "View My Orders"
  };

  if (isFailed) {
    config = {
      icon: "❌", bgColor: "#f8d7da", borderColor: "#dc3545", textColor: "#721c24",
      title: "Payment Failed",
      message: "Unfortunately, your transaction could not be completed. Please check your bank details or try again.",
      btnText: "Go to My Orders"
    };
  } else if (isCancelled) {
    config = {
      icon: "⚠️", bgColor: "#fff3cd", borderColor: "#ffc107", textColor: "#856404",
      title: "Payment Cancelled",
      message: "You cancelled the payment process. Your cart items are still saved if you want to try again later.",
      btnText: "Go to My Orders"
    };
  }

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden", textAlign: "center" }}>
        <div style={{ backgroundColor: config.bgColor, padding: "40px 20px", borderBottom: `4px solid ${config.borderColor}` }}>
          <div style={{ fontSize: "5rem", marginBottom: "10px", lineHeight: 1 }}>{config.icon}</div>
          <h1 style={{ margin: 0, color: config.textColor, fontSize: "2rem" }}>{config.title}</h1>
        </div>
        <div style={{ padding: "30px" }}>
          <p style={{ color: "#555", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "25px" }}>{config.message}</p>
          <button onClick={() => navigate("/orders")} style={{ width: "100%", padding: "14px", backgroundColor: config.borderColor, color: "white", border: "none", borderRadius: "10px", fontSize: "1.1rem", fontWeight: "700", cursor: "pointer", transition: "transform 0.1s", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
            {config.btnText} →
          </button>
          <button onClick={() => navigate("/")} style={{ width: "100%", padding: "12px", marginTop: "10px", backgroundColor: "transparent", color: "#666", border: "1px solid #ddd", borderRadius: "10px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>
            Back to Home
          </button>
          {isFinalResult && (
            <p style={{ marginTop: "20px", color: "#999", fontSize: "0.9rem" }}>
              Auto-redirecting in <strong style={{ color: "#333" }}>{countdown}</strong> seconds...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

// Inline styles
const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "20px" },
  card: { background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)", maxWidth: "500px", width: "100%", padding: "40px", textAlign: "center" },
  title: { margin: "0 0 10px 0", color: "#333", fontSize: "24px" },
  subtitle: { margin: "0 0 20px 0", color: "#666", fontSize: "14px" },
  badge: { display: "inline-block", background: "#f0fdf4", color: "#16a34a", padding: "10px 20px", borderRadius: "50px", fontSize: "14px", fontWeight: "600", marginBottom: "20px" },
  summary: { background: "#f8f9fa", borderRadius: "12px", padding: "20px", textAlign: "left", marginBottom: "20px" },
  row: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb", fontSize: "14px", color: "#4b5563" },
  mono: { fontFamily: "monospace", fontSize: "12px", color: "#1f2937" },
  amount: { fontWeight: "bold", fontSize: "18px", color: "#667eea" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #667eea", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "20px auto" },
  loadingText: { color: "#666", fontSize: "14px", marginTop: "10px" },
  warning: { color: "#999", fontSize: "12px", marginTop: "5px" },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default PaymentResult;
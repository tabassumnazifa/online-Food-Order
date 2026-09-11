import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const isSuccess = path === "/payment/success";
  const isFailed = path === "/payment/fail";
  const isCancelled = path === "/payment/cancel";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/orders");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container">
      <div className="checkout-card">
        {isSuccess && (
          <>
            <h1>✅ Payment Successful</h1>
            <p>Your payment was completed successfully.</p>
            <p>Redirecting to your orders...</p>
          </>
        )}

        {isFailed && (
          <>
            <h1>❌ Payment Failed</h1>
            <p>Your payment could not be completed.</p>
            <p>Redirecting to your orders...</p>
          </>
        )}

        {isCancelled && (
          <>
            <h1>⚠️ Payment Cancelled</h1>
            <p>You cancelled the payment.</p>
            <p>Redirecting to your orders...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentResult;
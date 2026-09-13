import { useEffect, useRef, useState } from "react";

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 I'm Foodie, your Food Delivery assistant. Ask me anything about orders, payments, or delivery!",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // ==========================================
  // SIMPLE RULE-BASED BRAIN 🧠
  // ==========================================
  const getBotReply = (text) => {
    const t = text.toLowerCase();

    if (t.includes("hello") || t === "hi" || t.includes("hi ") || t.includes("hey")) {
      return "Hello! 😊 How can I help you today?";
    }
    if ((t.includes("where") || t.includes("track") || t.includes("status")) && t.includes("order")) {
      return "You can track your order status anytime from the 'My Orders' page! 📦";
    }
    if (t.includes("cancel") || t.includes("refund")) {
      return "You can cancel an order from 'My Orders' as long as the rider hasn't picked it up yet. Paid orders are refunded automatically within 3-5 business days. 💰";
    }
    if (t.includes("deliver") || t.includes("fee") || t.includes("charge")) {
      return "Great news — delivery is completely FREE on all orders! 🛵";
    }
    if (t.includes("payment") || t.includes("card") || t.includes("cod") || t.includes("cash")) {
      return "We accept Cash on Delivery and secure online payments (cards & mobile banking) via SSLCommerz. 💳";
    }
    if (t.includes("coupon") || t.includes("offer") || t.includes("discount") || t.includes("promo")) {
      return "Check the 'Offers' page for active coupon codes, then apply them at checkout to save money! 🎁";
    }
    if (t.includes("restaurant") || t.includes("menu") || t.includes("food")) {
      return "Browse all restaurants from the 'Restaurants' page and tap 'View Menu' to see their delicious dishes! 🍕";
    }
    if (t.includes("thank")) {
      return "You're very welcome! Happy eating! 🍔❤️";
    }
    return "Hmm, I'm just a simple bot so I didn't quite get that! 🤖 Try asking about orders, delivery fees, payments, coupons, or cancellations.";
  };

  const sendMessage = (rawText) => {
    const text = rawText.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setIsTyping(true);

    // Fake "thinking" delay for realism
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: getBotReply(text) }]);
      setIsTyping(false);
    }, 700);
  };

  const quickQuestions = [
    "Where is my order?",
    "Delivery fee?",
    "Payment methods?",
    "How to cancel?",
  ];

  return (
    <>
      {/* ============ FLOATING BUTTON ============ */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open chat assistant"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#1b5e20",
          color: "white",
          fontSize: "1.7rem",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* ============ CHAT WINDOW ============ */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "96px",
            right: "24px",
            width: "340px",
            maxWidth: "calc(100vw - 48px)",
            height: "460px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              background: "linear-gradient(135deg, #1b5e20, #43a047)",
              color: "white",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>🤖</span>
            <div>
              <strong style={{ display: "block", fontSize: "1rem" }}>Foodie Assistant</strong>
              <small style={{ opacity: 0.85 }}>● Online — replies instantly</small>
            </div>
          </div>

          {/* MESSAGES */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              backgroundColor: "#f6f8f6",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor: m.sender === "user" ? "#1b5e20" : "white",
                  color: m.sender === "user" ? "white" : "#333",
                  padding: "10px 14px",
                  borderRadius: m.sender === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  maxWidth: "80%",
                  fontSize: "0.9rem",
                  lineHeight: 1.45,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {m.text}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "white",
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  fontSize: "0.9rem",
                  color: "#888",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                Foodie is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK QUESTION CHIPS */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              padding: "8px 10px",
              overflowX: "auto",
              backgroundColor: "white",
              borderTop: "1px solid #eee",
            }}
          >
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                style={{
                  flexShrink: 0,
                  padding: "6px 10px",
                  backgroundColor: "#e8f5e9",
                  color: "#1b5e20",
                  border: "1px solid #c8e6c9",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* INPUT ROW */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            style={{ display: "flex", gap: "8px", padding: "10px", backgroundColor: "white" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "20px",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 16px",
                backgroundColor: "#1b5e20",
                color: "white",
                border: "none",
                borderRadius: "20px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBot;
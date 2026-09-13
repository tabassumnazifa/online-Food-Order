import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

function RiderLocationTracker({ orderId, status }) {
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const connectionRef = useRef(null);

  // Normalize status to check if it's OutForDelivery
  const isOutForDelivery = status?.toLowerCase().replace(/\s+/g, "") === "outfordelivery";

  // 1. Establish SignalR Connection automatically when status is OutForDelivery
  useEffect(() => {
    if (isOutForDelivery && !connectionRef.current) {
      const token = localStorage.getItem("token");
      
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5079/hubs/tracking", {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      newConnection.start()
        .then(() => {
          console.log("🟢 SignalR Connected to Tracking Hub!");
          // Join the private room for this specific order
          newConnection.invoke("JoinOrderGroup", orderId)
            .then(() => console.log(`Joined Order Group: Order_${orderId}`));
          
          connectionRef.current = newConnection;
          setIsConnected(true);
        })
        .catch(err => {
          console.error("SignalR Connection Error: ", err);
          setError("Failed to connect to tracking server. Check console.");
        });
    }
    
    // Cleanup connection when component unmounts
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [isOutForDelivery, orderId]);

  // 2. Start GPS Broadcasting
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // watchPosition continuously tracks the rider's movement
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Send coordinates to the backend SignalR Hub
        if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
          connectionRef.current.invoke("UpdateRiderLocation", orderId, latitude, longitude)
            .catch(err => console.error("Send Error: ", err));
        }
      },
      (err) => {
        console.error("Geolocation Error: ", err);
        setError("GPS permission denied. Please enable location services in your browser.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    setWatchId(id);
    setIsTracking(true);
    setError("");
  };

  // 3. Stop GPS Broadcasting
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  // Cleanup GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  // Hide component entirely if the order is not OutForDelivery
  if (!isOutForDelivery) return null;

  return (
    <div style={{ 
      marginTop: "20px", 
      padding: "20px", 
      background: "#f0fdf4", 
      borderRadius: "12px", 
      border: "2px solid #22c55e",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ marginBottom: "10px", color: "#166534", margin: 0 }}>📍 Live GPS Tracking</h3>
      <p style={{ color: "#15803d", marginBottom: "15px", fontSize: "14px" }}>
        Share your real-time location with the customer so they can watch their food arrive on the map!
      </p>

      {error && (
        <p style={{ color: "#dc2626", fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}>
          ⚠️ {error}
        </p>
      )}

      {!isTracking ? (
        <button 
          onClick={startTracking} 
          disabled={!isConnected}
          style={{ 
            padding: "12px 24px", 
            background: isConnected ? "#22c55e" : "#9ca3af", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            cursor: isConnected ? "pointer" : "not-allowed",
            fontWeight: "bold",
            fontSize: "16px",
            width: "100%",
            transition: "background 0.2s"
          }}
        >
          {isConnected ? "🟢 Start Sharing Live Location" : "Connecting to server..."}
        </button>
      ) : (
        <div>
          <p style={{ color: "#15803d", fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}>
            🟢 Broadcasting your location to the customer...
          </p>
          <button 
            onClick={stopTracking} 
            style={{ 
              padding: "10px 20px", 
              background: "#ef4444", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              transition: "background 0.2s"
            }}
          >
            ⏹ Stop Sharing
          </button>
        </div>
      )}
    </div>
  );
}

export default RiderLocationTracker;
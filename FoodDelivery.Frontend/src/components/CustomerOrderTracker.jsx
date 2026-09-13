import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons in React/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icon for the Rider (Motorcycle/Truck)
const riderIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/713/713311.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Custom icon for the Restaurant (Store)
const restaurantIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Custom icon for the Customer (Home/Person)
const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854888.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

function CustomerOrderTracker({ orderId, status, restaurantLat = 23.8103, restaurantLng = 90.4125 }) {
  const [riderLocation, setRiderLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  
  const connectionRef = useRef(null);

  // Normalize status
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "");
  const isTrackingEligible = ["preparing", "readyforpickup", "outfordelivery", "delivered"].includes(normalizedStatus);

  // 1. Get Customer's Location (Browser Geolocation)
  useEffect(() => {
    if (isTrackingEligible && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.warn("Customer location denied or unavailable:", err);
          // Default to restaurant location if denied
          setCustomerLocation({ lat: restaurantLat, lng: restaurantLng });
        }
      );
    }
  }, [isTrackingEligible, restaurantLat, restaurantLng]);

  // 2. Establish SignalR Connection to listen for rider updates
  useEffect(() => {
    if (isTrackingEligible && !connectionRef.current) {
      const token = localStorage.getItem("token");
      
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5079/hubs/tracking", {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      newConnection.start()
        .then(() => {
          console.log("🟢 Customer SignalR Connected!");
          // Join the private room for this specific order
          newConnection.invoke("JoinOrderGroup", orderId)
            .then(() => console.log(`Joined Order Group: Order_${orderId}`));
          
          // Listen for rider location updates from the backend
          newConnection.on("ReceiveRiderLocation", (lat, lng) => {
            console.log(`📍 Rider moved to: ${lat}, ${lng}`);
            setRiderLocation({ lat, lng });
          });

          connectionRef.current = newConnection;
          setIsConnected(true);
        })
        .catch(err => {
          console.error("SignalR Connection Error: ", err);
          setError("Failed to connect to live tracking.");
        });
    }
    
    // Cleanup connection on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("ReceiveRiderLocation");
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [isTrackingEligible, orderId]);

  // Calculate map center based on available locations
  const getMapCenter = () => {
    if (riderLocation && customerLocation) {
      // Center between rider and customer
      return [
        (riderLocation.lat + customerLocation.lat) / 2,
        (riderLocation.lng + customerLocation.lng) / 2
      ];
    }
    return [restaurantLat, restaurantLng];
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  if (!isTrackingEligible) {
    return (
      <div style={{ padding: "20px", background: "#f3f4f6", borderRadius: "12px", textAlign: "center" }}>
        <p> Live tracking will be available once the restaurant starts preparing your order.</p>
      </div>
    );
  }

  const mapCenter = getMapCenter();
  const distance = riderLocation && customerLocation 
    ? calculateDistance(riderLocation.lat, riderLocation.lng, customerLocation.lat, customerLocation.lng)
    : null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ marginBottom: "10px", color: "#1f2937" }}>🗺️ Live Order Tracking</h3>
      
      {error && <p style={{ color: "#dc2626", marginBottom: "10px" }}>⚠️ {error}</p>}
      
      <div style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #e5e7eb" }}>
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
        >
          {/* OpenStreetMap Tile Layer (100% Free) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Restaurant Marker (Static) */}
          <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
            <Popup>🏪 Restaurant Location</Popup>
          </Marker>

          {/* Rider Marker (Dynamic - only shows when rider starts sharing) */}
          {riderLocation && (
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>🚚 Your Rider is here!</Popup>
            </Marker>
          )}

          {/* Customer Marker (Delivery Destination) */}
          {customerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
              <Popup> You are here (Delivery Address)</Popup>
            </Marker>
          )}

          {/* Route Line (Rider to Customer) */}
          {riderLocation && customerLocation && (
            <Polyline
              positions={[
                [riderLocation.lat, riderLocation.lng],
                [customerLocation.lat, customerLocation.lng]
              ]}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
              dashArray="5, 5"
            />
          )}
        </MapContainer>
      </div>

      <div style={{ marginTop: "10px", display: "flex", gap: "15px", fontSize: "14px", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "1.2rem" }}>🏪</span> Restaurant
        </span>
        {riderLocation ? (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#16a34a", fontWeight: "bold" }}>
            <span style={{ fontSize: "1.2rem" }}></span> Rider is moving live!
          </span>
        ) : (
          <span>⏳ Waiting for rider to start sharing location...</span>
        )}
        {customerLocation && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "1.2rem" }}>📍</span> Your Location
          </span>
        )}
        {distance && (
          <span style={{ color: "#3b82f6", fontWeight: "bold" }}>
            📏 {distance} km away
          </span>
        )}
      </div>
    </div>
  );
}

export default CustomerOrderTracker;
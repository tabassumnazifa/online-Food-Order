import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// ==========================================
// GLOBAL TIMEZONE OVERRIDE (BANGLADESH TIME)
// Forces all dates in the app to use Asia/Dhaka
// ==========================================
const originalToLocaleString = Date.prototype.toLocaleString;
Date.prototype.toLocaleString = function(locale, options) {
  options = options || {};
  if (!options.timeZone) {
    options.timeZone = 'Asia/Dhaka';
  }
  return originalToLocaleString.call(this, locale, options);
};

const originalToLocaleDateString = Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString = function(locale, options) {
  options = options || {};
  if (!options.timeZone) {
    options.timeZone = 'Asia/Dhaka';
  }
  return originalToLocaleDateString.call(this, locale, options);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
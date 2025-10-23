import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

console.log("Starting application...");

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, rendering app...");
  try {
    createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App rendered successfully!");
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}

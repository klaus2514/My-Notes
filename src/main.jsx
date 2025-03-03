import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Correct
import App from "./App";
import "./styles/global.css"; // Ensure global styles are imported

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Router should only be here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

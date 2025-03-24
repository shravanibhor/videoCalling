import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import VideoCallApp from "../components/videocard";
import History from "./History"; // Import the History component
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // Center content vertically
          alignItems: "center", // Center content horizontally
          minHeight: "100vh", // Ensure it covers the full height of the viewport
          width: "100vw", // Ensure it spans the full width of the viewport
          margin: "0", // Remove any default margin
          backgroundColor: "#f8f9fa", // Light background color
          padding: "0", // Remove padding to ensure full coverage
        }}
      >
        <div
          style={{
            width: "100%", // Make the header span the full width
          }}
        >
          <Header />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%", // Take full width
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px", // Limit the width for better readability
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add subtle shadow
              borderRadius: "15px", // Rounded corners
              backgroundColor: "#ffffff", // White background for contrast
            }}
          >
            <Routes>
              <Route path="/" element={<VideoCallApp />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

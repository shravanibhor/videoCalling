import Header from "./header";
import Footer from "./footer";
import VideoCallApp from "./videocard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa", // Light background color
        padding: "20px", // Add padding for better spacing
      }}
    >
      <Header />
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
          <VideoCallApp />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;

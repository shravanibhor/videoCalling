import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container
        style={{
          display: "flex",
          justifyContent: "center", // Center the entire content horizontally
          alignItems: "center",
          gap: "200px", // Add spacing between navigation links and brand
        }}
      >
        <Navbar.Brand
          href="#"
          style={{
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Video Calling
        </Navbar.Brand>
        <Nav style={{ display: "flex", gap: "15px" }}> {/* Navigation links with reduced gap */}
          <Nav.Link as={Link} to="/" style={{ fontWeight: "500" }}>
            Home
          </Nav.Link>
          <Nav.Link as={Link} to="/history" style={{ fontWeight: "500" }}>
            History
          </Nav.Link>
          <Nav.Link as={Link} to="/settings" style={{ fontWeight: "500" }}>
            Settings
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;
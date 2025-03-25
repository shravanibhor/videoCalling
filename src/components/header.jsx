import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" className="shadow">
      <Container
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Navbar.Brand
          href="/"
          style={{
            fontWeight: "bold",
            fontSize: "1.5rem",
            marginRight: "50px", // Add some gap between Navbar.Brand and Nav
          }}
        >
          Video Calling
        </Navbar.Brand>
        <Nav style={{ display: "flex", gap: "15px" }}>
          <Nav.Link
            as={Link}
            to="/"
            style={{
              fontWeight: "500",
              color: location.pathname === "/" ? "#fff" : "#ccc",
            }}
          >
            Home
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/history"
            style={{
              fontWeight: "500",
              color: location.pathname === "/history" ? "#fff" : "#ccc",
            }}
          >
            History
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/settings"
            style={{
              fontWeight: "500",
              color: location.pathname === "/settings" ? "#fff" : "#ccc",
            }}
          >
            Settings
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;

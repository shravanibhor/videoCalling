import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container } from "react-bootstrap";

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand href="#" style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          Video Calling
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#" style={{ fontWeight: "500" }}>
              Home
            </Nav.Link>
            <Nav.Link href="#" style={{ fontWeight: "500" }}>
              History
            </Nav.Link>
            <Nav.Link href="#" style={{ fontWeight: "500" }}>
              Settings
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
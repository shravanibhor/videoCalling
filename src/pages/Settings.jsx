import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cameraPermission, setCameraPermission] = useState(true);
  const [micPermission, setMicPermission] = useState(true);

  const handleSaveChanges = (e) => {
    e.preventDefault();

    // Validate all fields are filled
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Save settings to localStorage or handle accordingly
    const settings = {
      username,
      email,
      password,
      cameraPermission,
      micPermission,
    };
    localStorage.setItem("userSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  return (
    <Container>
      <h1>Settings</h1>
      <Form onSubmit={handleSaveChanges}>
        <Form.Group controlId="username" style={{ marginBottom: "15px" }}>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="email" style={{ marginBottom: "15px" }}>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password" style={{ marginBottom: "15px" }}>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group
          controlId="cameraPermission"
          style={{ marginBottom: "15px" }}
        >
          <Form.Check
            type="switch"
            label="Camera Permission"
            checked={cameraPermission}
            onChange={(e) => setCameraPermission(e.target.checked)}
          />
        </Form.Group>
        <Form.Group controlId="micPermission" style={{ marginBottom: "15px" }}>
          <Form.Check
            type="switch"
            label="Microphone Permission"
            checked={micPermission}
            onChange={(e) => setMicPermission(e.target.checked)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Save Changes
        </Button>
      </Form>
    </Container>
  );
};

export default Settings;

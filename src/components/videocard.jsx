import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "../styles/index.css";

const VideoCallApp = () => {
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Function to get camera and microphone access
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera and microphone:", error);
      // alert("Could not access camera and microphone. Please allow permissions.");
    }
  };

  // Function to stop camera and microphone
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCallStarted(false);

    // Calculate call duration
    const callEndTime = new Date();
    const duration = Math.round((callEndTime - callStartTime) / 6000); // Duration in minutes

    // Update the last call entry with the duration
    const history = JSON.parse(localStorage.getItem("videoCallHistory")) || [];
    if (history.length > 0) {
      history[history.length - 1].duration = duration;
      localStorage.setItem("videoCallHistory", JSON.stringify(history));
    }
  };

  // Function to generate a unique code
  const generateCode = () => {
    const newCode = uuidv4().slice(0, 6).toUpperCase();
    setGeneratedCode(newCode);
    setCode(newCode);
  };

  // Function to start the call
  const startCall = () => {
    if (code.trim().length === 6) {
      setCallStarted(true);
      setCallStartTime(new Date());
      startCamera();

      // Save call details to localStorage
      const callDetails = {
        date: new Date().toLocaleString(),
        code: code,
        participants: ["You"], // Add participants as needed
      };
      const history =
        JSON.parse(localStorage.getItem("videoCallHistory")) || [];
      history.push(callDetails);
      localStorage.setItem("videoCallHistory", JSON.stringify(history));
    } else {
      alert("Enter a valid code to join the call");
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center custom-light-green"
      style={{
        minHeight: "100vh", // Full height of the viewport
        fontFamily: "cursive",
      }}
    >
      {!callStarted ? (
        <Card
          className="p-5 shadow-lg text-center custom-pale-peach"
          style={{
            maxWidth: "600px", // Wider card for desktop view
            borderRadius: "20px",
          }}
        >
          <Card.Body>
            <Card.Title
              className="mb-4 custom-text-color"
              style={{ fontSize: "2rem", fontWeight: "bold" }}
            >
              Join a Video Call
            </Card.Title>
            <Form.Group className="mb-4">
              <Form.Label
                className="text-secondary"
                style={{ fontWeight: "500" }}
              >
                Enter Code
              </Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter call code"
                className="rounded-2"
                style={{
                  padding: "12px",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                }}
              />
            </Form.Group>
            <Button
              style={{
                backgroundColor: "#FB6F92",
                color: "#fff",
                border: "none",
              }}
              className="w-100 mb-3"
              onClick={startCall}
            >
              Join Call
            </Button>
            <hr className="my-4" />
            <Button
              style={{
                backgroundColor: "#0492C2",
                color: "#fff",
                border: "none",
              }}
              className="w-100"
              onClick={generateCode}
            >
              Generate Code
            </Button>
            {generatedCode && (
              <p
                className="mt-4 text-info"
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                Share this code: <strong>{generatedCode}</strong>
              </p>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row
          className="w-100 h-100 bg-dark text-white rounded-3"
          style={{
            padding: "20px",
          }}
        >
          <Col className="d-flex flex-column justify-content-center align-items-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-100 h-100 rounded-3 border border-white"
            ></video>
            <Button
              variant="danger"
              className="mt-3 rounded-2"
              onClick={stopCamera}
            >
              End Call
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VideoCallApp;

import React, { useState, useRef, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "../styles/index.css";

// Create a global connection manager to persist across tab changes
const globalConnectionManager = {
  isConnected: false,
  code: "",
  peerConnection: null,
  channel: null,
  localStream: null,
  remoteStream: null,
  callStartTime: null,
  offerSent: false,

  // Save connection state to localStorage
  saveState() {
    localStorage.setItem(
      "videoCallState",
      JSON.stringify({
        isConnected: this.isConnected,
        code: this.code,
        callStartTime: this.callStartTime
          ? this.callStartTime.toISOString()
          : null,
        offerSent: this.offerSent,
      })
    );
  },

  // Load connection state from localStorage
  loadState() {
    const savedState = localStorage.getItem("videoCallState");
    if (savedState) {
      const state = JSON.parse(savedState);
      this.isConnected = state.isConnected;
      this.code = state.code;
      this.callStartTime = state.callStartTime
        ? new Date(state.callStartTime)
        : null;
      this.offerSent = state.offerSent;
      return state;
    }
    return null;
  },

  // Clean up resources
  cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    this.isConnected = false;
    this.remoteStream = null;
    this.offerSent = false;
    this.saveState();
  },
};

// Initialize the global connection manager
globalConnectionManager.loadState();

const VideoCallApp = () => {
  const [code, setCode] = useState(globalConnectionManager.code || "");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [callStarted, setCallStarted] = useState(
    globalConnectionManager.isConnected
  );
  const [callStartTime, setCallStartTime] = useState(
    globalConnectionManager.callStartTime
  );
  const [remoteStream, setRemoteStream] = useState(
    globalConnectionManager.remoteStream
  );
  const [connectionStatus, setConnectionStatus] = useState("");
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(globalConnectionManager.localStream);
  const peerConnectionRef = useRef(globalConnectionManager.peerConnection);
  const offerSentRef = useRef(globalConnectionManager.offerSent);
  const channelRef = useRef(globalConnectionManager.channel);

  // Function to get camera and microphone access
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      globalConnectionManager.localStream = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (error) {
      console.error("Error accessing camera and microphone:", error);
      alert(
        "Could not access camera and microphone. Please ensure no other applications are using these resources and that permissions are granted."
      );
    }
  };

  // Function to stop camera and microphone and close peer connection
  const stopCamera = () => {
    globalConnectionManager.cleanup();

    setCallStarted(false);
    setRemoteStream(null);
    setConnectionStatus("");

    // Calculate call duration
    if (callStartTime) {
      const callEndTime = new Date();
      const duration = Math.round((callEndTime - callStartTime) / 60000); // Duration in minutes

      // Update the last call entry with the duration
      const history =
        JSON.parse(localStorage.getItem("videoCallHistory")) || [];
      if (history.length > 0) {
        history[history.length - 1].duration = duration;
        localStorage.setItem("videoCallHistory", JSON.stringify(history));
      }
    }
  };

  // Function to generate a unique code
  const generateCode = () => {
    const newCode = uuidv4().slice(0, 6).toUpperCase();
    setGeneratedCode(newCode);
    setCode(newCode);
  };

  const initWebRTC = async () => {
    setConnectionStatus("Initializing connection...");

    // Create a new peer connection with a TURN server added
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "d7cc0d98dad7c7309dfd9c93",
          credential: "IXU2wGnZBEn1IQX3",
        },
      ],
    });
    peerConnectionRef.current = pc;
    globalConnectionManager.peerConnection = pc;

    // Add local tracks to the connection
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });
    }

    // Log ICE candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        console.log("Sending ICE candidate:", event.candidate);
        channelRef.current.postMessage({
          type: "candidate",
          candidate: event.candidate.toJSON(), // Serialize candidate
        });
      } else {
        console.log("ICE candidate gathering complete.");
      }
    };

    // Connection state change handler
    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      setConnectionStatus(`Connection state: ${pc.connectionState}`);
    };

    // ICE connection state change handler
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
      setConnectionStatus(`ICE state: ${pc.iceConnectionState}`);
    };

    // When remote tracks arrive, set the remote stream and log it
    pc.ontrack = (event) => {
      console.log("Received remote track:", event);
      if (event.streams && event.streams[0]) {
        console.log("Received remote stream:", event.streams[0]);
        setRemoteStream(event.streams[0]);
        globalConnectionManager.remoteStream = event.streams[0];

        // Ensure the remote video element is properly set up
        if (remoteVideoRef.current) {
          console.log("Setting remote video source");
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.onloadedmetadata = () => {
            console.log("Remote video metadata loaded, playing...");
            remoteVideoRef.current
              .play()
              .then(() => console.log("Remote video playing successfully"))
              .catch((err) =>
                console.error("Error playing remote video:", err)
              );
          };
        } else {
          console.error("Remote video ref is not available");
        }
      } else {
        console.error("No streams in the track event");
      }
    };

    // Initialize the BroadcastChannel for simple signaling
    const channel = new BroadcastChannel(code);
    channelRef.current = channel;
    globalConnectionManager.channel = channel;

    channel.onmessage = async (msg) => {
      const data = msg.data;
      console.log("Channel message received:", data);

      // If an offer is received, set it as remote description and send an answer
      if (data.type === "offer" && !pc.currentRemoteDescription) {
        try {
          setConnectionStatus("Received offer, creating answer...");
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("Sending answer:", answer);
          channel.postMessage({ type: "answer", answer });
          setConnectionStatus("Answer sent, waiting for connection...");
        } catch (err) {
          console.error("Error handling offer:", err);
          setConnectionStatus(`Error handling offer: ${err.message}`);
        }
      }
      // When an answer is received, set it as remote description
      else if (data.type === "answer") {
        try {
          setConnectionStatus("Received answer, completing connection...");
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log("Answer accepted");
          setConnectionStatus("Connection established");
        } catch (err) {
          console.error("Error handling answer:", err);
          setConnectionStatus(`Error handling answer: ${err.message}`);
        }
      }
      // When receiving ICE candidates, add them to the peer connection
      else if (data.type === "candidate" && data.candidate) {
        try {
          console.log("Adding received candidate:", data.candidate);
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding received candidate", err);
        }
      }
    };

    // As soon as the channel is ready, send an offer (if not already sent)
    if (!offerSentRef.current) {
      try {
        setConnectionStatus("Creating and sending offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("Sending offer:", offer);
        channel.postMessage({ type: "offer", offer });
        offerSentRef.current = true;
        globalConnectionManager.offerSent = true;
        setConnectionStatus("Offer sent, waiting for answer...");
      } catch (err) {
        console.error("Error creating offer:", err);
        setConnectionStatus(`Error creating offer: ${err.message}`);
      }
    }
  };

  // Function to start the call and initialize WebRTC signaling
  const startCall = async () => {
    if (code.trim().length === 6) {
      setCallStarted(true);
      setCallStartTime(new Date());

      // Update global connection manager
      globalConnectionManager.isConnected = true;
      globalConnectionManager.code = code;
      globalConnectionManager.callStartTime = new Date();
      globalConnectionManager.saveState();

      await startCamera();
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

      // Initialize WebRTC and signaling
      initWebRTC();
    } else {
      alert("Enter a valid code to join the call");
    }
  };

  // Initialize component based on saved state
  useEffect(() => {
    const savedState = globalConnectionManager.loadState();
    if (savedState && savedState.isConnected) {
      // If we have a saved connection, try to restore it
      console.log("Restoring saved connection state");
      setCallStarted(true);
      setCode(savedState.code);

      // Start camera and initialize WebRTC
      startCamera().then(() => {
        initWebRTC();
      });
    }

    // Clean up resources when component unmounts
    return () => {
      // Don't stop the camera or close connections when navigating between tabs
      // Only clean up when the user explicitly ends the call
    };
  }, []);

  // Update remote video when remoteStream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Setting remote video from useEffect");
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.onloadedmetadata = () => {
        console.log("Remote video metadata loaded in useEffect, playing...");
        remoteVideoRef.current
          .play()
          .then(() =>
            console.log("Remote video playing successfully from useEffect")
          )
          .catch((err) =>
            console.error("Error playing remote video from useEffect:", err)
          );
      };
    }
  }, [remoteStream]);

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center custom-light-green"
      style={{
        minHeight: "100vh",
        fontFamily: "cursive",
      }}
    >
      {!callStarted ? (
        <Card
          className="p-5 shadow-lg text-center custom-pale-peach"
          style={{ maxWidth: "600px", borderRadius: "20px" }}
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
                style={{ fontWeight: "bold", fontSize: "1.2rem" }}
              >
                Share this code: <strong>{generatedCode}</strong>
              </p>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row
          className="w-100 h-100 bg-dark text-white rounded-3"
          style={{ padding: "20px" }}
        >
          <Col className="d-flex flex-column justify-content-center align-items-center">
            <div
              className="video-container mb-3"
              style={{ width: "100%", maxWidth: "640px" }}
            >
              <h5 className="mb-2">Your Video</h5>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-100 rounded-3 border border-white"
                style={{
                  transform: "scaleX(-1)",
                  maxHeight: "240px",
                  objectFit: "cover",
                }}
              ></video>
            </div>

            <div
              className="video-container mb-3"
              style={{ width: "100%", maxWidth: "640px" }}
            >
              <h5 className="mb-2">Remote Video</h5>
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-100 rounded-3 border border-white"
                  style={{
                    maxHeight: "240px",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                  }}
                ></video>
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center bg-secondary rounded-3"
                  style={{ height: "240px", width: "100%" }}
                >
                  <p className="text-white">Waiting for remote stream...</p>
                </div>
              )}
            </div>

            {/* {connectionStatus && (
              <div className="connection-status mb-3">
                <p className="text-info">{connectionStatus}</p>
              </div>
            )} */}

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

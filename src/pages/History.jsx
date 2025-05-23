import React, { useEffect, useState } from "react";

const History = () => {
  const [callHistory, setCallHistory] = useState([]);

  useEffect(() => {
    // Retrieve call history from localStorage
    const history = JSON.parse(localStorage.getItem("videoCallHistory")) || [];

    // Filter to only include calls with a duration property
    const completedCalls = history.filter(
      (call) =>
        call.duration !== undefined &&
        call.duration !== null &&
        call.duration !== 0
    );

    setCallHistory(completedCalls);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Video Call History</h2>
      {callHistory.length === 0 ? (
        <p>No completed calls in history.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {callHistory.map((call, index) => (
            <li
              key={index}
              style={{
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <p>
                <strong>Date:</strong> {call.date}
              </p>
              <p>
                <strong>Code:</strong> {call.code}
              </p>
              <p>
                <strong>Duration:</strong> {call.duration} minutes
              </p>
              <p>
                <strong>Participants:</strong> {call.participants.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;

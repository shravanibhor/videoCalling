import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import pkg from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// Create Express app
const app = express();
const server = createServer(app);
const { json } = pkg;

// Middleware
app.use(cors());
app.use(json());
app.use(express.static('public'));

// Store active calls (in memory, will be lost on server restart)
const activeCalls = new Map();

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Generate a unique call code
app.post('/api/calls', (req, res) => {
    const callId = uuidv4().slice(0, 6).toUpperCase();
    activeCalls.set(callId, {
        id: callId,
        createdAt: new Date(),
        participants: [],
        status: 'waiting'
    });

    console.log(`Created new call with ID: ${callId}`);
    res.json({ callId, status: 'created' });
});

// Join a call
app.post('/api/calls/:callId/join', (req, res) => {
    const { callId } = req.params;
    const { userId, username } = req.body;

    if (!activeCalls.has(callId)) {
        console.log(`Attempted to join non-existent call: ${callId}`);
        return res.status(404).json({ error: 'Call not found' });
    }

    const call = activeCalls.get(callId);
    call.participants.push({ userId, username, joinedAt: new Date() });
    call.status = 'active';

    console.log(`User ${username} (${userId}) joined call ${callId}`);
    res.json({ status: 'joined', call });
});

// Leave a call
app.post('/api/calls/:callId/leave', (req, res) => {
    const { callId } = req.params;
    const { userId } = req.body;

    if (!activeCalls.has(callId)) {
        console.log(`Attempted to leave non-existent call: ${callId}`);
        return res.status(404).json({ error: 'Call not found' });
    }

    const call = activeCalls.get(callId);
    call.participants = call.participants.filter(p => p.userId !== userId);

    if (call.participants.length === 0) {
        console.log(`Call ${callId} ended - no participants left`);
        activeCalls.delete(callId);
        return res.json({ status: 'call-ended' });
    }

    console.log(`User ${userId} left call ${callId}`);
    res.json({ status: 'left', call });
});

// Get call status
app.get('/api/calls/:callId', (req, res) => {
    const { callId } = req.params;

    if (!activeCalls.has(callId)) {
        console.log(`Attempted to get status of non-existent call: ${callId}`);
        return res.status(404).json({ error: 'Call not found' });
    }

    const call = activeCalls.get(callId);
    console.log(`Status requested for call ${callId}: ${call.status}`);
    res.json(call);
});

// WebRTC signaling endpoints (these don't actually do anything)
app.post('/api/signaling/:callId/offer', (req, res) => {
    const { callId } = req.params;
    const { from, to, sdp } = req.body;

    console.log(`Received offer from ${from} to ${to} for call ${callId}`);
    // In a real implementation, we would store this and notify the recipient

    res.json({ status: 'offer-received' });
});

app.post('/api/signaling/:callId/answer', (req, res) => {
    const { callId } = req.params;
    const { from, to, sdp } = req.body;

    console.log(`Received answer from ${from} to ${to} for call ${callId}`);
    // In a real implementation, we would store this and notify the recipient

    res.json({ status: 'answer-received' });
});

app.post('/api/signaling/:callId/ice-candidate', (req, res) => {
    const { callId } = req.params;
    const { from, to, candidate } = req.body;

    console.log(`Received ICE candidate from ${from} to ${to} for call ${callId}`);
    // In a real implementation, we would store this and notify the recipient

    res.json({ status: 'ice-candidate-received' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});

// Clean up inactive calls periodically
setInterval(() => {
    const now = new Date();
    for (const [callId, call] of activeCalls.entries()) {
        // Remove calls that are older than 24 hours
        if (now - call.createdAt > 24 * 60 * 60 * 1000) {
            console.log(`Removing inactive call: ${callId}`);
            activeCalls.delete(callId);
        }
    }
}, 60 * 60 * 1000); // Run every hour
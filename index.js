const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins (modify for security)
        methods: ["GET", "POST"]
    }
});

const users = {};

// Handle socket connection
io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Handle new user joining
    socket.on("new-user-joined", (name) => {
        users[socket.id] = name;
        socket.broadcast.emit("user-joined", name);
        console.log(`${name} joined the chat`);
    });

    // Handle messages
    socket.on("send", (message) => {
        socket.broadcast.emit("receive", { message: message, name: users[socket.id] });
    });

    // Handle typing event
    socket.on("typing", () => {
        socket.broadcast.emit("user-typing", users[socket.id]);
    });

    socket.on("stop-typing", () => {
        socket.broadcast.emit("user-stopped-typing");
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        if (users[socket.id]) {
            socket.broadcast.emit("left", users[socket.id]);
            console.log(`${users[socket.id]} left the chat`);
            delete users[socket.id];
        }
    });
});

// Start server
const PORT = 5500;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


const socket = io("http://localhost:5500");
        
// DOM elements
const form = document.getElementById("send-container");
const messageInp = document.getElementById("messageInp");
const messageContainer = document.querySelector(".container");
const typingIndicator = document.getElementById("typing-indicator");
const typingText = document.getElementById("typing-text");

// Variables
let typingTimeout;
let currentUsername = "";

// Append message to chat
const append = (message, position) => {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.classList.add("message");
    messageElement.classList.add(position);
    messageContainer.insertBefore(messageElement, typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

// Handle form submission
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInp.value.trim();
    
    if (message) {
        append(`You: ${message}`, 'right');
        socket.emit("send", message);
        messageInp.value = '';
        // Clear typing status when sending
        socket.emit("stop-typing");
    }
});

// Typing detection
messageInp.addEventListener("input", () => {
    socket.emit("typing");
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit("stop-typing");
    }, 1000);
});

// Get username and join chat
currentUsername = prompt("Enter your name to join") || "Anonymous";
socket.emit("new-user-joined", currentUsername);

// Socket event handlers
socket.on("user-joined", name => {
    append(`${name} joined the chat`, 'right');
});

socket.on("receive", data => {
    append(`${data.name}: ${data.message}`, 'left');
});

socket.on("left", name => {
    append(`${name} left the chat`, 'right');
});

socket.on("user-typing", name => {
    if (name !== currentUsername) {
        typingText.textContent = `${name} is typing...`;
        typingIndicator.style.display = "block";
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
});

socket.on("user-stopped-typing", () => {
    typingIndicator.style.display = "none";
});


const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle client connections
io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    socket.on('send-location', (data) => {
        // Broadcast location to all clients
        io.emit('receive-location', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
        // Notify all clients about the disconnection
        io.emit('disconnected', socket.id);
    });

    socket.on('user-disconnect', () => {
        // Handle disconnection explicitly from client
        socket.disconnect();
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.render('index'); // Render the 'index' view
});

// Start server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

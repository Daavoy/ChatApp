import express from 'express';
import { Server } from 'socket.io'; // Import the named export 'Server' from 'socket.io'
import { createServer } from 'http';

const PORT = process.env.PORT || 5000;

const app = express();
const server = createServer(app);

app.post('/users', (req, res) => {
    const { userName } = req.body
})


const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        optionsSuccessStatus: 200,
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('client connected:', socket.id);
    socket.join('main-room');

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined ${data}`);
    });
    socket.on("send_message", (data) => {
        console.log("DATA:", data)
        console.log(data)
        socket.to("main-room").emit("receive_message", data);
    });
    socket.on('disconnect', (reason) => {
        console.log(reason);
    });
});

setInterval(() => {
    io.to('main-room').emit('time', new Date());
}, 1000);

server.listen(PORT, err => {
    if (err) {
        console.error(err);
    }
    console.log('Server running on port:', PORT);
});

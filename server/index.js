import express from 'express';
import path from "path";
import dotenv from "dotenv";
import { Server } from 'socket.io'; // Import the named export 'Server' from 'socket.io'
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { CLIENT_RENEG_WINDOW } from 'tls';

const app = express();
const server = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });


const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;




const client = new MongoClient(mongoURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



const db = client.db("chatapplication");
const users = db.collection("users");



app.post('/users', async (req, res) => {
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

    socket.on("join_room", async (data, callback) => {

        try {
            const existingUser = await users.findOne({ username: data });
            if (existingUser) {
                callback({ success: false, message: "User already exists" });
                return;
            }

            const doc = { username: data, messages: [] };
            const results = await users.insertOne(doc)
            socket.join(data);
            console.log(`User with ID: ${socket.id} joined ${data}`);
            console.log(`user with _id ${results.insertedId} added to collection`)
            callback({ success: true, message: "User joined successfully" });
        } catch (err) {
            console.error("error storing user", err)
            callback({ success: false, message: "Server error" });
        }
    });
    socket.on("send_message", (data) => {
        console.log("DATA:", data)
        console.log(data)
        socket.to("main-room").emit("receive_message", data);
    });
    socket.on('disconnect', (reason) => {
        console.log(reason);
        console.log("closing mongodb connection");
        client.close();
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
    console.log("connecting to mongodb");
    client.connect();
});



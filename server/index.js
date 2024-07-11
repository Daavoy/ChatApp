import express from 'express';
import cors from 'cors';
import path from "path";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';

import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import { User } from "./models/User.js"
import { userRoute } from './routes/userRoute.js';
import { authenticationRoute } from './routes/authenticationRoute.js';
const app = express();
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173", // Adjust the origin to match your client's actual origin
    credentials: true,
}));
const server = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

const client = new MongoClient(mongoURI, {

});



const db = client.db("chatapplication");
const channels = db.collection("channels");
const commands = db.collection("commands");



function configureApp() {

    app.use('/api/auth', authenticationRoute);
    app.use('/api/users', userRoute);

    app.get('/commands', async (req, res) => {
        try {
            const commandList = await commands.find().toArray();
            console.log("commandlist", commandList)
            res.json({ commands: commandList });
        } catch (err) {
            console.error("Error fetching commands:", err);
            res.status(500).json({ message: "Server error" });
        }
    });

    // Socket.io handling
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            optionsSuccessStatus: 200,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.join('main-room');

        // socket.on("join_room", async (data, callback) => {
        //     try {
        //         const existingUser = await users.findOne({ username: data });
        //         if (existingUser) {
        //             callback({ success: false, message: "User already exists" });
        //             return;
        //         }
        //         const result = await users.insertOne({ username: data.username, messages: [] });
        //         socket.join(data);
        //         console.log(`User with ID: ${socket.id} joined ${data}`);
        //         console.log(`User with ID: ${result.insertedId} added to collection`);
        //         callback({ success: true, message: "User joined successfully" });
        //     } catch (err) {
        //         console.error("Error storing user:", err);
        //         callback({ success: false, message: "Server error" });
        //     }
        // });

        socket.on('create_channel', async (data, callback) => {
            try {
                const existingChannel = await channels.findOne({ channelName: data });
                if (existingChannel) {
                    callback({ success: false, message: "Channel already exists" });
                    return;
                }
                await channels.insertOne({ channelName: data });
                callback({ success: true, message: `Channel ${data} created successfully` });
            } catch (err) {
                console.error("Error creating new channel:", err);
                callback({ success: false, message: "Server error" });
            }
        });

        socket.on('delete_channel', async (data, callback) => {
            try {
                const existingChannel = await channels.findOne({ channelName: data });
                if (!existingChannel) {
                    callback({ success: false, message: `Channel ${data} does not exist` });
                    return;
                }
                const result = await channels.deleteOne({ channelName: data });
                if (result.deletedCount === 1) {
                    callback({ success: true, message: `Channel ${data} deleted successfully` });
                } else {
                    callback({ success: false, message: `Error deleting channel ${data}` });
                }
            } catch (err) {
                console.error("Error deleting channel:", err);
                callback({ success: false, message: "Server error" });
            }
        });

        socket.on("send_message", (data) => {
            console.log("Message received:", data);


            socket.to("main-room").emit("receive_message", data);
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        });
    });
}
mongoose.connect(mongoURI).then(() => {
    console.log("Connected to mongoDB")
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        configureApp();
    });
}).catch((err) => {
    console.log(err);
});
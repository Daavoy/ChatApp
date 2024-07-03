import express from "express";
import { User } from "../models/User";

const router = express.Router();

router.post('/users', async (req, res) => {
    const { userName } = req.body;
    try {
        const existingUser = await User.findOne({ username: userName });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const result = await User.insertOne({ username: userName, messages: [] });
        res.status(201).json({ message: "User created successfully", userId: result.insertedId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";
import express from "express";

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" })
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ username: username }, 'secret');
        res.status(200).json({ token })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    };
}

const register = async (req, res) => {
    try {
        const password = req.body.password;
        const username = req.body.username;
        const existingUser = await User.findOne({ userName: username });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username: username,
            password: hashedPassword,
        })
        await newUser.save();
        res.status(201).json({ message: "User registered successfully! " });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export {
    login,
    register
}
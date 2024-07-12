import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/jwtHelper.js";
import { User } from "../models/User.js";
import express from "express";

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }


        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.cookie("jwt", refreshToken, {
            httpOnly: true,  //accessible only by web server
            secure: false,    //https
            sameSite: 'none', // cross-site cookie,
            maxAge: 60 * 15,
        });
        return res.status(200).send({ accessToken })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' + err.message });
        return;
    };
}

const register = async (req, res) => {
    try {
        const password = req.body.password;
        const username = req.body.username;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const refreshToken = generateRefreshToken(username);
        const newUser = new User({
            username: username,
            password: hashedPassword,
            tokens: [{ token: refreshToken }],
            messages: []
        })
        const accessToken = generateAccessToken(newUser);
        await newUser.save();
        res.cookie("jwt", refreshToken, {
            httpOnly: true,  //accessible only by web server
            secure: false,    //https
            sameSite: 'none', // cross-site cookie,
            maxAge: 60 * 15,
        });
        return res.status(201).send({ message: "User registered successfully! ", accessToken: accessToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const refreshToken = cookies.jwt;
    verifyAccessToken(refreshToken);
    asyncHAndler(async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const foundUser = await User.findOne({ username: decoded.username });
        if (!founduser) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const accessToken = generateAccessToken(foundUser);
        res.json({ accessToken });
    });
}

const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(204);
    }
    //TODO SET SECURE TO TRUE FOR HTTPS
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: false });
    res.json({ message: "cookie cleared" });
}

export {
    login,
    logout,
    register
}
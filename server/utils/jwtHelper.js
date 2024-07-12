import jwt from "jsonwebtoken";
import express from 'express';
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });
const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username, roles: user.roles }, ACCESS_SECRET_KEY, {
        expiresIn: "15m"
    });
}
const generateRefreshToken = (username) => {
    return jwt.sign({ username: username }, REFRESH_SECRET_KEY, {
        expiresIn: "30d"
    });
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_SECRET_KEY);
}
const verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET_KEY);
}

//MIDDLEWARE
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    };
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_SECRET_KEY,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden" });
            }
            req.user = decoded.username;
            req.roles = decoded.roles;
            next();
        }
    )
}

export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, verifyJWT };
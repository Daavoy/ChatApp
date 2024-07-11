import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";

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

        const token = jwt.sign({ username: username }, 'secret');
        return res.status(200).json({ token })
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
        console.log(existingUser)
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username: username,
            password: hashedPassword,
        })

        console.log("new user: ", newUser);
        await newUser.save();
        console.log(newUser)
        return res.status(201).json({ message: "User registered successfully! " });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export {
    login,
    register
}
import express from "express";
import { User } from "../models/User.js";

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting user");
        const result = await User.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: `Object not found` });
        }
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: `Cannot find user with ID ${id}` });
        }
        res.status(200).json();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        console.log("Users", users)
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export {
    getUsers,
    getUserById,
    deleteUserById
};
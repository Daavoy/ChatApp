import express from "express";
import { User } from "../models/User.js";
import { getUsers, getUserById, deleteUserById } from "../controllers/userController.js";
const router = express.Router();

console.log("Setting up routes");

router.get('/', getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUserById)

export { router as userRoute };
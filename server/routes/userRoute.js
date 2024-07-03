import express from "express";
import { User } from "../models/User.js";
import { getUsers, getUserById } from "../controllers/userController.js";
const router = express.Router();

router.get('/', getUsers);
router.get("/:id", getUserById);

export { router as userRoute };
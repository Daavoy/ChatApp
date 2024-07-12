import express from "express";
import { getUsers, getUserById, deleteUserById } from "../controllers/userController.js";
import { verifyJWT } from "../utils/jwtHelper.js";
const router = express.Router();

console.log("Setting up routes");
router.use(verifyJWT);
router.get('/', getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUserById)

export { router as userRoute };
import express from "express";
import { login, register } from "../controllers/authenticationController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);


export { router as authenticationRoute };
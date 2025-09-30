import express from "express";
import { loginUser, getProfile} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/", createUser);   
router.post("/login", loginUser);       // POST /api/users/login
// router.get("/profile", protect, getProfile); // GET /api/users/profile


export default router


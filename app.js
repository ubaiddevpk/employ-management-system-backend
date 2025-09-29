import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import employeeRoutes from "./src/routes/employeeRoutes.js";
import userRoute from "./src/routes/userRoutes.js"
import { errorHandler } from "./src/middlewares/errorMiddleware.js";

import { connectDB } from "./src/config/db.js";

dotenv.config();

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors({
  origin: "https://employee-website-qlut.vercel.app",
     // ✅ Your frontend local URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Optional: allowed methods
  // credentials: true // Optional: if you need cookies/auth
}));
app.use(express.json());

 
app.use("/api/users", userRoute);  
app.use("/api/employees", employeeRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

export default app;

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
const allowedOrigins = [
  "https://employee-website-qlut.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

 
app.use("/api/users", userRoute);  
app.use("/api/employees", employeeRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

export default app;

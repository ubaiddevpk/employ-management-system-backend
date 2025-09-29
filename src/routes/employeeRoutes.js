// import express from "express";
// import {
//   getEmployee,
//   addEmployee,
//   updateEmployee,
//   deleteEmployee,
// } from "../controllers/employeeController.js";
// import { protect } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// // Public Routes
// router.get("/", getEmployee);

// // Protected Routes (require login)
// router.post("/", protect, addEmployee);
// router.put("/:id", protect, updateEmployee);
// router.delete("/:id", protect, deleteEmployee);

// export default router;



// routes/employeeRoutes.js
import express from "express";
import {
  getEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getSingleEmployee,
} from "../controllers/employeeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getEmployee); // Get all employees
router.get("/:id", getSingleEmployee); // Get single employee

// Protected Routes (require login) - Remove protect temporarily for testing
// router.post("/", addEmployee); // Add new employee
// router.put("/:id", updateEmployee); // Update employee
// router.delete("/:id", deleteEmployee); // Delete employee

// When you're ready to add authentication back, uncomment these:
router.post("/", protect, addEmployee);
router.put("/:id", protect, updateEmployee);
router.delete("/:id", protect, deleteEmployee);

export default router;
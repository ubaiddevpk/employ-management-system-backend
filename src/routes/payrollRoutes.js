import express from "express";
import {
  createPayrollRun,
  getAllPayrolls,
  getPayrollById,
  updatePayrollStatus,
  deletePayroll,
  getPayrollStats,
  recalculatePayroll,
  getYearlyPayroll
} from "../controllers/payrollController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route   POST /api/payroll/run
// @desc    Create a new payroll run
router.post("/run",protect, createPayrollRun);

// @route   GET /api/payroll/stats
// @desc    Get payroll statistics
router.get("/stats",protect, getPayrollStats);


router.get("/yearly",protect, getYearlyPayroll);  // ✅ Add this before router.get("/:id")
// @route   GET /api/payroll
// @desc    Get all payroll runs
router.get("/",protect, getAllPayrolls);

// @route   GET /api/payroll/:id
// @desc    Get single payroll by ID
router.get("/:id",protect, getPayrollById);

router.get("/yearly/:year",protect, getYearlyPayroll);

// @route   PUT /api/payroll/:id
// @desc    Update payroll status (mark as ready/paid)
router.put("/:id",protect, updatePayrollStatus);

// @route   DELETE /api/payroll/:id
// @desc    Delete payroll (DRAFT only)
router.delete("/:id", protect,deletePayroll);

// @route   POST /api/payroll/:id/recalculate
// @desc    Recalculate payroll (DRAFT only)
router.post("/:id/recalculate",protect, recalculatePayroll);

export default router;
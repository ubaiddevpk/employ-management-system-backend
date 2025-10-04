// models/Employee.js - Updated Schema
import mongoose from "mongoose";

const advanceSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },       // Original advance amount
    deduction: { type: Number, default: 0 },        // Monthly deduction
    date: { type: Date, required: true },           // Date advance was taken
    reason: { type: String, required: true },       // Reason for advance
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },       // Original loan amount
    deduction: { type: Number, default: 0 },        // Monthly deduction
    date: { type: Date, required: true },           // Date loan was taken
    reason: { type: String, required: true },       // Reason for loan
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    employeeID: { type: String, required: true, unique: true },
    address: { type: String, required: true }, // Location field
    basicSalary: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 }, // Add overtime field
    phoneNumber: { type: String, required: true }, // Add phone number field
    
    // Arrays of advance/loan objects
    advances: { type: [advanceSchema], default: [] },
    loans: { type: [loanSchema], default: [] },
    
    cnic: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    leavingDate: {type: Date}, //new leaving date
    jobTitle: { type: String, required: true },
    netSalary: { type: Number, required: true },
    
    // Pre-calculated remaining amounts for quick access
    remainingAdvance: { type: Number, default: 0 },
    remainingLoan: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
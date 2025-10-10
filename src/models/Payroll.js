import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    monthNumber: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    employees: [
      {
        employeeId: String,
        employeeMongoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        name: String,
        jobTitle: String,
        location: String,
        basicSalary: Number,
        commission: Number,
        overtime: Number,
        grossSalary: Number,
        advanceDeduction: Number,
        loanDeduction: Number,
        totalDeductions: Number,
        remainingAdvanceBefore: Number,
        remainingLoanBefore: Number,
        remainingAdvanceAfter: Number,
        remainingLoanAfter: Number,
        netSalary: Number,
        receiptGenerated: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalEmployees: {
      type: Number,
      required: true,
    },
    totalGrossPay: {
      type: Number,
      required: true,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    totalNetPay: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "READY", "PAID", "OVERDUE"],
      default: "DRAFT",
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    processedBy: {
      type: String,
    },
    // ✅ NEW FIELDS for manual selection
    payrollType: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },
    selectedEmployeeIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ paymentDate: 1 });

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
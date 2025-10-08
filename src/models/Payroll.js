import mongoose from "mongoose";

const payrollEmployeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    name: { type: String, required: true },
    jobTitle: { type: String },
    location: { type: String },
    
    // Salary Components
    basicSalary: { type: Number, required: true, default: 0 },
    commission: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
    
    // Deductions
    advanceDeduction: { type: Number, default: 0 },
    loanDeduction: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    
    // Remaining Balances (before this payroll)
    remainingAdvanceBefore: { type: Number, default: 0 },
    remainingLoanBefore: { type: Number, default: 0 },
    
    // Remaining Balances (after this payroll)
    remainingAdvanceAfter: { type: Number, default: 0 },
    remainingLoanAfter: { type: Number, default: 0 },
    
    // Final Pay
    netSalary: { type: Number, required: true },
    
    // Receipt Reference
    receiptGenerated: { type: Boolean, default: false },
    receiptNumber: { type: String },
  },
  { _id: false }
);

const payrollSchema = new mongoose.Schema(
  {
    // Payroll Period
    month: { type: String, required: true }, // "October 2025"
    year: { type: Number, required: true },
    monthNumber: { type: Number, required: true }, // 0-11 (January = 0)
    
    // Payment Details
    paymentDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    
    // Employees in this payroll
    employees: [payrollEmployeeSchema],
    
    // Totals
    totalEmployees: { type: Number, required: true },
    totalGrossPay: { type: Number, required: true, default: 0 },
    totalAdvanceDeductions: { type: Number, default: 0 },
    totalLoanDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNetPay: { type: Number, required: true, default: 0 },
    
    // Status
    status: {
      type: String,
      enum: ["DRAFT", "READY", "PAID", "OVERDUE"],
      default: "DRAFT",
    },
    
    // Notes
    notes: { type: String },
    
    // Processing Info
    processedBy: { type: String },
    paidAt: { type: Date },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ createdAt: -1 });

// Virtual for formatted period
payrollSchema.virtual('period').get(function() {
  return `${this.month} ${this.year}`;
});

// Pre-save middleware to calculate totals
payrollSchema.pre('save', function(next) {
  if (this.employees && this.employees.length > 0) {
    this.totalEmployees = this.employees.length;
    this.totalGrossPay = this.employees.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0);
    this.totalAdvanceDeductions = this.employees.reduce((sum, emp) => sum + (emp.advanceDeduction || 0), 0);
    this.totalLoanDeductions = this.employees.reduce((sum, emp) => sum + (emp.loanDeduction || 0), 0);
    this.totalDeductions = this.totalAdvanceDeductions + this.totalLoanDeductions;
    this.totalNetPay = this.employees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0);
  }
  next();
});

// Method to check if payroll is overdue
payrollSchema.methods.isOverdue = function() {
  return this.status === 'READY' && new Date() > this.dueDate;
};

// Static method to find current month's payroll
payrollSchema.statics.findCurrentMonth = function() {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  return this.findOne({ month, year }).sort({ createdAt: -1 });
};

export default mongoose.model("Payroll", payrollSchema);
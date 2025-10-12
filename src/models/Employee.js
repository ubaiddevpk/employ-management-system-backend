
import mongoose from "mongoose";

const advanceSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },       // Original advance amount
    deduction: { type: Number, default: 0 },        // Monthly deduction
    remainingAmount: { type: Number, default: 0 },  // ✅ ADD THIS
    date: { type: Date, required: true },           // Date advance was taken
    reason: { type: String, required: true },       // Reason for advance
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },       // Original loan amount
    deduction: { type: Number, default: 0 },        // Monthly deduction
    remainingAmount: { type: Number, default: 0 },  // ✅ ADD THIS
    date: { type: Date, required: true },           // Date loan was taken
    reason: { type: String, required: true },       // Reason for lodan
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    employeeID: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    phoneNumber: { type: String, required: true },
    
    // Arrays of advance/loan objects
    advances: { type: [advanceSchema], default: [] },
    loans: { type: [loanSchema], default: [] },
    
    cnic: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    leavingDate: { type: Date },
    jobTitle: { type: String, required: true },
    netSalary: { type: Number, required: true },
    
    // Pre-calculated remaining amounts for quick access
    remainingAdvance: { type: Number, default: 0 },
    remainingLoan: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ ADD PRE-SAVE MIDDLEWARE to auto-calculate remainingAmount
// employeeSchema.pre('save', function(next) {
//   // Calculate remainingAmount for each advance if not set
//   this.advances?.forEach(advance => {
//     if (advance.remainingAmount === undefined || advance.remainingAmount === 0) {
//       advance.remainingAmount = advance.amount;
//     }
//   });

//   // Calculate remainingAmount for each loan if not set
//   this.loans?.forEach(loan => {
//     if (loan.remainingAmount === undefined || loan.remainingAmount === 0) {
//       loan.remainingAmount = loan.amount;
//     }
//   });

//   // Recalculate totals
//   this.remainingAdvance = this.advances?.reduce(
//     (sum, adv) => sum + (adv.remainingAmount || 0),
//     0
//   ) || 0;

//   this.remainingLoan = this.loans?.reduce(
//     (sum, loan) => sum + (loan.remainingAmount || 0),
//     0
//   ) || 0;

//   next();
// });


// ✅ PRE-SAVE MIDDLEWARE to auto-calculate remainingAmount correctly
employeeSchema.pre("save", function (next) {
  // ✅ Calculate remainingAmount for each advance
  if (this.advances && this.advances.length > 0) {
    this.advances = this.advances.map((adv) => ({
      ...adv,
      remainingAmount:
        adv.deduction && adv.deduction > 0
          ? adv.amount - adv.deduction
          : adv.amount,
    }));
  }

  // ✅ Calculate remainingAmount for each loan
  if (this.loans && this.loans.length > 0) {
    this.loans = this.loans.map((loan) => ({
      ...loan,
      remainingAmount:
        loan.deduction && loan.deduction > 0
          ? loan.amount - loan.deduction
          : loan.amount,
    }));
  }

  // ✅ Calculate total remaining advance and loan
  this.remainingAdvance =
    this.advances?.reduce(
      (sum, adv) => sum + (adv.remainingAmount || 0),
      0
    ) || 0;

  this.remainingLoan =
    this.loans?.reduce(
      (sum, loan) => sum + (loan.remainingAmount || 0),
      0
    ) || 0;

  next();
});


// ✅ PRE-UPDATE MIDDLEWARE: also auto-calculate on edit/update
employeeSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // If no advances or loans are being updated, skip recalculation
  if (!update) return next();

  // ✅ Handle advances recalculation
  if (update.advances && Array.isArray(update.advances)) {
    update.advances = update.advances.map((adv) => ({
      ...adv,
      remainingAmount:
        adv.deduction && adv.deduction > 0
          ? adv.amount - adv.deduction
          : adv.amount,
    }));
    // Recalculate total remainingAdvance
    update.remainingAdvance = update.advances.reduce(
      (sum, adv) => sum + (adv.remainingAmount || 0),
      0
    );
  }

  // ✅ Handle loans recalculation
  if (update.loans && Array.isArray(update.loans)) {
    update.loans = update.loans.map((loan) => ({
      ...loan,
      remainingAmount:
        loan.deduction && loan.deduction > 0
          ? loan.amount - loan.deduction
          : loan.amount,
    }));
    // Recalculate total remainingLoan
    update.remainingLoan = update.loans.reduce(
      (sum, loan) => sum + (loan.remainingAmount || 0),
      0
    );
  }

  next();
});


export default mongoose.model("Employee", employeeSchema);
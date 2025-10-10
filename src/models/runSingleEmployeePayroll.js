import Employee from "../models/Employee.js";

// @desc    Process payroll for a single employee
// @route   POST /api/payroll/run-single
// @access  Private
export const runSingleEmployeePayroll = async (req, res) => {
  try {
    const { employeeId, notes, processedBy } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Find the employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if employee is active
    const now = new Date();
    if (employee.leavingDate && new Date(employee.leavingDate) <= now) {
      return res.status(400).json({
        success: false,
        message: "Cannot process payroll for inactive employee",
      });
    }

    console.log(`\n📋 Processing payroll for: ${employee.name}`);

    let totalAdvanceDeduction = 0;
    let totalLoanDeduction = 0;

    // Process advances
    if (employee.advances && employee.advances.length > 0) {
      for (let adv of employee.advances) {
        if (adv.remainingAmount > 0 && adv.deduction > 0) {
          const deductAmount = Math.min(adv.deduction, adv.remainingAmount);
          
          console.log(`  Advance: ${adv.reason}, Before: ${adv.remainingAmount}, Deducting: ${deductAmount}`);
          
          adv.amount = adv.amount - deductAmount;
          adv.remainingAmount = adv.remainingAmount - deductAmount;
          totalAdvanceDeduction += deductAmount;
        }
      }

      // Remove fully paid advances
      employee.advances = employee.advances.filter(adv => adv.remainingAmount > 0);
      employee.markModified("advances");

      // Update remainingAdvance total
      employee.remainingAdvance = employee.advances.reduce(
        (sum, adv) => sum + (adv.remainingAmount || 0),
        0
      );

      console.log(`  Total advance deduction: ${totalAdvanceDeduction}`);
      console.log(`  Remaining advances: ${employee.remainingAdvance}`);
    }

    // Process loans
    if (employee.loans && employee.loans.length > 0) {
      for (let loan of employee.loans) {
        if (loan.remainingAmount > 0 && loan.deduction > 0) {
          const deductAmount = Math.min(loan.deduction, loan.remainingAmount);
          
          console.log(`  Loan: ${loan.reason}, Before: ${loan.remainingAmount}, Deducting: ${deductAmount}`);
          
          loan.amount = loan.amount - deductAmount;
          loan.remainingAmount = loan.remainingAmount - deductAmount;
          totalLoanDeduction += deductAmount;
        }
      }

      // Remove fully paid loans
      employee.loans = employee.loans.filter(loan => loan.remainingAmount > 0);
      employee.markModified("loans");

      // Update remainingLoan total
      employee.remainingLoan = employee.loans.reduce(
        (sum, loan) => sum + (loan.remainingAmount || 0),
        0
      );

      console.log(`  Total loan deduction: ${totalLoanDeduction}`);
      console.log(`  Remaining loans: ${employee.remainingLoan}`);
    }

    // Recalculate net salary
    const grossSalary = (employee.basicSalary || 0) + 
                       (employee.commission || 0) + 
                       (employee.overtime || 0);
    
    employee.netSalary = grossSalary - employee.remainingAdvance - employee.remainingLoan;

    // Save the updated employee
    await employee.save();

    console.log(`✅ Payroll processed for ${employee.name}`);
    console.log(`   Net Salary: ${employee.netSalary}`);
    console.log(`   Remaining Advance: ${employee.remainingAdvance}`);
    console.log(`   Remaining Loan: ${employee.remainingLoan}`);

    res.status(200).json({
      success: true,
      message: `Payroll processed successfully for ${employee.name}`,
      data: {
        employeeName: employee.name,
        advanceDeduction: totalAdvanceDeduction,
        loanDeduction: totalLoanDeduction,
        totalDeduction: totalAdvanceDeduction + totalLoanDeduction,
        netSalary: employee.netSalary,
        remainingAdvance: employee.remainingAdvance,
        remainingLoan: employee.remainingLoan,
      },
    });
  } catch (error) {
    console.error("Error processing single employee payroll:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payroll",
      error: error.message,
    });
  }
};
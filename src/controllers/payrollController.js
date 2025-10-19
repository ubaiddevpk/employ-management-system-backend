import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";

// @desc    Create a new payroll run (fetch all employees and calculate)
// @route   POST /api/payroll/run
// @access  Private
export const createPayrollRun = async (req, res) => {
  try {
    // Auto-generate for current month
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const monthNumber = now.getMonth() + 1;
    
    // Set payment date to last day of current month
    const paymentDate = new Date(year, now.getMonth() + 1, 0);
    
    // Set due date to 5 days after payment date
    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + 5);

    // ✅ NEW: Get payrollType and selectedEmployeeIds from request
    const { notes, processedBy, payrollType, selectedEmployeeIds } = req.body;

    console.log('📋 Creating Payroll Run:');
    console.log('   Payroll Type:', payrollType);
    console.log('   Selected Employee IDs:', selectedEmployeeIds);

    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({ month, year });
    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: `Payroll for ${month} ${year} already exists`,
      });
    }

    // ✅ MODIFIED: Build query based on payroll type
    let employeeQuery = {
      $or: [
        { leavingDate: { $exists: false } },
        { leavingDate: null },
        { leavingDate: { $gt: now } }
      ]
    };

    // ✅ NEW: If manual selection, filter by selected IDs
    if (payrollType === 'manual' && selectedEmployeeIds && selectedEmployeeIds.length > 0) {
      employeeQuery._id = { $in: selectedEmployeeIds };
      console.log('   📌 Manual Selection: Filtering employees by IDs');
    } else {
      console.log('   📌 Auto Mode: Processing all active employees');
    }

    // Fetch employees based on query
    const employees = await Employee.find(employeeQuery);

    console.log(`   ✅ Found ${employees.length} employees to process`);

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: payrollType === 'manual' 
          ? "No employees found for the selected IDs"
          : "No active employees found",
      });
    }

    // Calculate payroll for each employee
    const payrollEmployees = employees.map((employee) => {
      const basicSalary = employee.basicSalary || 0;
      const commission = employee.commission || 0;
      const overtime = employee.overtime || 0;
      const grossSalary = basicSalary + commission + overtime;

      const remainingAdvanceBefore = employee.advances?.reduce((sum, adv) => sum + (adv.remainingAmount || 0), 0) || 0;
      const remainingLoanBefore = employee.loans?.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0) || 0;

      // Calculate this month's deductions
      let advanceDeduction = 0;
      let loanDeduction = 0;

      employee.advances?.forEach((adv) => {
        if (adv.remainingAmount > 0 && adv.deduction > 0) {
          advanceDeduction += Math.min(adv.deduction, adv.remainingAmount);
        }
      });

      employee.loans?.forEach((loan) => {
        if (loan.remainingAmount > 0 && loan.deduction > 0) {
          loanDeduction += Math.min(loan.deduction, loan.remainingAmount);
        }
      });

      const totalDeductions = advanceDeduction + loanDeduction;
      const remainingAdvanceAfter = Math.max(0, remainingAdvanceBefore - advanceDeduction);
      const remainingLoanAfter = Math.max(0, remainingLoanBefore - loanDeduction);
      const netSalary = grossSalary - totalDeductions;

      return {
        employeeId: employee.employeeID,
        employeeMongoId: employee._id,
        name: employee.name,
        jobTitle: employee.jobTitle,
        location: employee.address,
        basicSalary,
        commission,
        overtime,
        grossSalary,
        advanceDeduction,
        loanDeduction,
        totalDeductions,
        remainingAdvanceBefore,
        remainingLoanBefore,
        remainingAdvanceAfter,
        remainingLoanAfter,
        netSalary,
        receiptGenerated: false,
      };
    });

    // Calculate totals
    const totalGrossPay = payrollEmployees.reduce((sum, e) => sum + e.grossSalary, 0);
    const totalDeductions = payrollEmployees.reduce((sum, e) => sum + e.totalDeductions, 0);
    const totalNetPay = payrollEmployees.reduce((sum, e) => sum + e.netSalary, 0);

    // ✅ NEW: Store payroll type and selected IDs
    const payroll = await Payroll.create({
      month,
      year,
      monthNumber,
      paymentDate,
      dueDate,
      employees: payrollEmployees,
      totalEmployees: payrollEmployees.length,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      status: "DRAFT",
      notes,
      processedBy,
      payrollType: payrollType || 'auto', // ✅ NEW: Store payroll type
      selectedEmployeeIds: payrollType === 'manual' ? selectedEmployeeIds : undefined, // ✅ NEW: Store selected IDs
    });

    console.log('   ✅ Payroll created successfully');
    console.log(`   📊 Total Employees: ${payrollEmployees.length}`);
    console.log(`   💰 Total Net Pay: ${totalNetPay}`);

    res.status(201).json({
      success: true,
      message: `Payroll run created successfully (${payrollType === 'manual' ? 'Manual' : 'Auto'} mode)`,
      data: payroll,
    });
  } catch (error) {
    console.error("❌ Error creating payroll run:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payroll run",
      error: error.message,
    });
  }
};

// @desc    Get all payroll runs
// @route   GET /api/payroll
// @access  Private
export const getAllPayrolls = async (req, res) => {
  try {
    const { status, year, month } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (year) filter.year = parseInt(year);
    if (month) filter.month = month;

    const payrolls = await Payroll.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Check for overdue payrolls and update status
    const now = new Date();
    for (let payroll of payrolls) {
      if (payroll.status === "READY" && new Date(payroll.dueDate) < now) {
        await Payroll.findByIdAndUpdate(payroll._id, { status: "OVERDUE" });
        payroll.status = "OVERDUE";
      }
    }

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payrolls",
      error: error.message,
    });
  }
};

// @desc    Get single payroll by ID
// @route   GET /api/payroll/:id
// @access  Private
export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    console.error("Error fetching payroll:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payroll",
      error: error.message,
    });
  }
};

// @desc    Update payroll status (mark as ready/paid)
// @route   PUT /api/payroll/:id
// @access  Private
export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({ success: false, message: "Payroll not found" });
    }

    // Prevent reapplying deductions
    if (status === "PAID" && payroll.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payroll is already marked as PAID. Deductions cannot be reapplied.",
      });
    }

    payroll.status = status;

    if (status === "PAID") {
      payroll.paidAt = new Date();

      for (const payrollEmployee of payroll.employees) {
        const employee = await Employee.findById(payrollEmployee.employeeMongoId);
        if (!employee) continue;

        console.log(`\n📋 Processing employee: ${employee.name}`);
        console.log(`Advance deduction: ${payrollEmployee.advanceDeduction}`);
        console.log(`Loan deduction: ${payrollEmployee.loanDeduction}`);

        // Deduct advances - Process each advance individually by modifying in place
        if (payrollEmployee.advanceDeduction > 0 && employee.advances && employee.advances.length > 0) {
          for (let adv of employee.advances) {
            if (adv.remainingAmount > 0 && adv.deduction > 0) {
              const deductAmount = Math.min(adv.deduction, adv.remainingAmount);
              
              console.log(`  Advance: ${adv.reason}, Original: ${adv.amount}, Remaining: ${adv.remainingAmount}, Deducting: ${deductAmount}`);
              
              // Only update the remainingAmount, keep the original amount unchanged
              adv.remainingAmount = adv.remainingAmount - deductAmount;
            }
          }

          // Remove fully paid advances (remainingAmount = 0)
          employee.advances = employee.advances.filter(adv => adv.remainingAmount > 0);

          // Mark as modified
          employee.markModified("advances");

          // Update remainingAdvance total
          employee.remainingAdvance = employee.advances.reduce(
            (sum, adv) => sum + (adv.remainingAmount || 0),
            0
          );

          console.log(`  Total remaining advances: ${employee.remainingAdvance}`);
        }

        // Deduct loans - Process each loan individually by modifying in place
        if (payrollEmployee.loanDeduction > 0 && employee.loans && employee.loans.length > 0) {
          for (let loan of employee.loans) {
            if (loan.remainingAmount > 0 && loan.deduction > 0) {
              const deductAmount = Math.min(loan.deduction, loan.remainingAmount);
              
              console.log(`  Loan: ${loan.reason}, Original: ${loan.amount}, Remaining: ${loan.remainingAmount}, Deducting: ${deductAmount}`);
              
              // Only update the remainingAmount, keep the original amount unchanged
              loan.remainingAmount = loan.remainingAmount - deductAmount;
            }
          }

          // Remove fully paid loans (remainingAmount = 0)
          employee.loans = employee.loans.filter(loan => loan.remainingAmount > 0);

          // Mark as modified
          employee.markModified("loans");

          // Update remainingLoan total
          employee.remainingLoan = employee.loans.reduce(
            (sum, loan) => sum + (loan.remainingAmount || 0),
            0
          );

          console.log(`  Total remaining loans: ${employee.remainingLoan}`);
        }

        // Recalculate net salary after deductions
        const grossSalary = (employee.basicSalary || 0) + 
                           (employee.commission || 0) + 
                           (employee.overtime || 0);
        
        employee.netSalary = grossSalary - employee.remainingAdvance - employee.remainingLoan;

        // Save the updated employee
        await employee.save();
        
        console.log(`✅ Employee ${employee.name} updated successfully`);
        console.log(`   Net Salary: ${employee.netSalary}`);
        console.log(`   Remaining Advance: ${employee.remainingAdvance}`);
        console.log(`   Remaining Loan: ${employee.remainingLoan}`);
      }
    }

    await payroll.save();

    res.status(200).json({
      success: true,
      message: `Payroll marked as ${status}${status === "PAID" ? " and deductions applied" : ""}`,
      data: payroll,
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payroll",
      error: error.message,
    });
  }
};

// @desc    Update payroll status (mark as ready/paid)
// @route   PUT /api/payroll/:id
// @access  Private
// @desc    Update payroll status (mark as ready/paid)



// @desc    Delete payroll (only DRAFT status)
// @route   DELETE /api/payroll/:id
// @access  Private
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    // Only allow deletion of DRAFT payrolls
    if (payroll.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete payroll that is not in DRAFT status",
      });
    }

    await Payroll.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting payroll",
      error: error.message,
    });
  }
};

// @desc    Get payroll summary/statistics
// @route   GET /api/payroll/stats
// @access  Private
export const getPayrollStats = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const payrolls = await Payroll.find({ year: currentYear });

    const stats = {
      totalPayrolls: payrolls.length,
      totalPaid: payrolls.filter((p) => p.status === "PAID").length,
      totalDraft: payrolls.filter((p) => p.status === "DRAFT").length,
      totalOverdue: payrolls.filter((p) => p.status === "OVERDUE").length,
      totalGrossPayYTD: payrolls.reduce((sum, p) => sum + (p.totalGrossPay || 0), 0),
      totalDeductionsYTD: payrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0),
      totalNetPayYTD: payrolls.reduce((sum, p) => sum + (p.totalNetPay || 0), 0),
      monthlyBreakdown: payrolls.map((p) => ({
        month: p.month,
        status: p.status,
        totalNetPay: p.totalNetPay,
        employeeCount: p.totalEmployees,
      })),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching payroll stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payroll statistics",
      error: error.message,
    });
  }
};

// @desc    Get yearly payroll summary (by year)
// @route   GET /api/payroll/yearly/:year
// @access  Private
export const getYearlyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ year: -1, monthNumber: -1 });
    res.status(200).json({
      success: true,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payroll",
      error: error.message,
    });
  }
};

// @desc    Recalculate payroll (for DRAFT only)
// @route   POST /api/payroll/:id/recalculate
// @access  Private
export const recalculatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    if (payroll.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Can only recalculate DRAFT payrolls",
      });
    }

    // Fetch latest employee data and recalculate
    const employeeIds = payroll.employees.map((e) => e.employeeMongoId);
    const employees = await Employee.find({ _id: { $in: employeeIds } });

    const updatedEmployees = employees.map((employee) => {
      const basicSalary = employee.basicSalary || 0;
      const commission = employee.commission || 0;
      const overtime = employee.overtime || 0;
      const grossSalary = basicSalary + commission + overtime;

      const remainingAdvanceBefore = employee.advances?.reduce(
        (sum, adv) => sum + (adv.remainingAmount || 0),
        0
      ) || 0;

      const remainingLoanBefore = employee.loans?.reduce(
        (sum, loan) => sum + (loan.remainingAmount || 0),
        0
      ) || 0;

      let advanceDeduction = 0;
      let loanDeduction = 0;

      employee.advances?.forEach((adv) => {
        if (adv.remainingAmount > 0 && adv.deduction > 0) {
          advanceDeduction += Math.min(adv.deduction, adv.remainingAmount);
        }
      });

      employee.loans?.forEach((loan) => {
        if (loan.remainingAmount > 0 && loan.deduction > 0) {
          loanDeduction += Math.min(loan.deduction, loan.remainingAmount);
        }
      });

      const totalDeductions = advanceDeduction + loanDeduction;
      const remainingAdvanceAfter = remainingAdvanceBefore - advanceDeduction;
      const remainingLoanAfter = remainingLoanBefore - loanDeduction;
      const netSalary = grossSalary - totalDeductions;

      return {
        employeeId: employee.employeeID,
        employeeMongoId: employee._id,
        name: employee.name,
        jobTitle: employee.jobTitle,
        location: employee.location,
        basicSalary,
        commission,
        overtime,
        grossSalary,
        advanceDeduction,
        loanDeduction,
        totalDeductions,
        remainingAdvanceBefore,
        remainingLoanBefore,
        remainingAdvanceAfter,
        remainingLoanAfter,
        netSalary,
        receiptGenerated: false,
      };
    });

    payroll.employees = updatedEmployees;
    await payroll.save();

    res.status(200).json({
      success: true,
      message: "Payroll recalculated successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("Error recalculating payroll:", error);
    res.status(500).json({
      success: false,
      message: "Error recalculating payroll",
      error: error.message,
    });
  }
};
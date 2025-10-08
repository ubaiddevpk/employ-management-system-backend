
// import Employee from "../models/Employee.js";

// // Get all employees
// export const getEmployee = async (req, res) => {
//   try {
//     const employees = await Employee.find({}).sort({ createdAt: -1 });
//     res.status(200).json(employees);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Add new employee
// export const addEmployee = async (req, res) => {
//   try {
//     const {
//       name,
//       employeeID,
//       address,
//       basicSalary,
//       commission,
//       overtime,
//       phoneNumber,
//       advances,
//       loans,
//       cnic,
//       joiningDate,
//       leavingDate,
//       jobTitle,
//       netSalary,
//       remainingAdvance,
//       remainingLoan
//     } = req.body;

//     // Check if employee ID already exists
//     const existingEmployee = await Employee.findOne({ employeeID });
//     if (existingEmployee) {
//       return res.status(400).json({ message: "Employee ID already exists" });
//     }

//     // Calculate remaining amounts if not provided
//     // const calculatedRemainingAdvance = remainingAdvance || (advances || []).reduce((sum, adv) => {
//     //   return sum + Math.max(0, (adv.amount || 0) - (adv.deduction || 0));
//     // }, 0);

//     // const calculatedRemainingLoan = remainingLoan || (loans || []).reduce((sum, loan) => {
//     //   return sum + Math.max(0, (loan.amount || 0) - (loan.deduction || 0));
//     // }, 0);


//     // ✅ NEW CODE - Initialize remainingAmount for advances
// const processedAdvances = (advances || []).map(adv => ({
//   ...adv,
//   remainingAmount: adv.remainingAmount !== undefined 
//     ? adv.remainingAmount 
//     : adv.amount
// }));

// // ✅ Initialize remainingAmount for loans
// const processedLoans = (loans || []).map(loan => ({
//   ...loan,
//   remainingAmount: loan.remainingAmount !== undefined 
//     ? loan.remainingAmount 
//     : loan.amount
// }));

// // Calculate totals
// const calculatedRemainingAdvance = processedAdvances.reduce(
//   (sum, adv) => sum + (adv.remainingAmount || 0), 
//   0
// );

// const calculatedRemainingLoan = processedLoans.reduce(
//   (sum, loan) => sum + (loan.remainingAmount || 0), 
//   0
// );

//     const newEmployee = new Employee({
//       name,
//       employeeID,
//       address,
//       basicSalary,
//       commission: commission || 0,
//       overtime: overtime || 0,
//       phoneNumber,
//       // advances: advances || [],
//       // loans: loans || [],


// // ✅ NEW
// advances: processedAdvances,
// loans: processedLoans,
//       cnic,
//       joiningDate,
//       leavingDate: leavingDate || null, // Add this line
//       jobTitle,
//       netSalary,
//       remainingAdvance: calculatedRemainingAdvance,
//       remainingLoan: calculatedRemainingLoan
//     });

//     const savedEmployee = await newEmployee.save();
//     res.status(201).json(savedEmployee);
//   } catch (error) {
//     console.error('Add employee error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update employee
// export const updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       employeeID,
//       address,
//       basicSalary,
//       commission,
//       overtime,
//       phoneNumber,
//       advances,
//       loans,
//       cnic,
//       joiningDate,
//       leavingDate, // Add this line
//       jobTitle,
//       netSalary,
//       remainingAdvance,
//       remainingLoan
//     } = req.body;

//     // Check if employee exists
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // Check if employeeID is being changed and if new ID already exists
//     if (employeeID && employeeID !== employee.employeeID) {
//       const existingEmployee = await Employee.findOne({ employeeID });
//       if (existingEmployee) {
//         return res.status(400).json({ message: "Employee ID already exists" });
//       }
//     }

//     // Calculate remaining amounts if not provided
//     // const calculatedRemainingAdvance = remainingAdvance || (advances || []).reduce((sum, adv) => {
//     //   return sum + Math.max(0, (adv.amount || 0) - (adv.deduction || 0));
//     // }, 0);

//     // const calculatedRemainingLoan = remainingLoan || (loans || []).reduce((sum, loan) => {
//     //   return sum + Math.max(0, (loan.amount || 0) - (loan.deduction || 0));
//     // }, 0);


// // ✅ NEW CODE - Initialize remainingAmount for advances
// // ✅ NEW CODE
// const processedAdvances = (advances || []).map(adv => ({
//   ...adv,
//   remainingAmount: adv.remainingAmount !== undefined 
//     ? adv.remainingAmount 
//     : adv.amount
// }));

// const processedLoans = (loans || []).map(loan => ({
//   ...loan,
//   remainingAmount: loan.remainingAmount !== undefined 
//     ? loan.remainingAmount 
//     : loan.amount
// }));

// const calculatedRemainingAdvance = processedAdvances.reduce(
//   (sum, adv) => sum + (adv.remainingAmount || 0), 
//   0
// );

// const calculatedRemainingLoan = processedLoans.reduce(
//   (sum, loan) => sum + (loan.remainingAmount || 0), 
//   0
// );





//     const updatedEmployee = await Employee.findByIdAndUpdate(
//       id,
//       {
//         name,
//         employeeID,
//         address,
//         basicSalary,
//         commission: commission || 0,
//         overtime: overtime || 0,
//         phoneNumber,
//         // advances: advances || [],
//         // loans: loans || [],


// // ✅ NEW
// advances: processedAdvances,
// loans: processedLoans,
//         cnic,
//         joiningDate,
//          leavingDate: leavingDate || null, // Add this line
//         jobTitle,
//         netSalary,
//         remainingAdvance: calculatedRemainingAdvance,
//         remainingLoan: calculatedRemainingLoan
//       },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json(updatedEmployee);
//   } catch (error) {
//     console.error('Update employee error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete employee
// export const deleteEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     await Employee.findByIdAndDelete(id);
//     res.status(200).json({ message: "Employee deleted successfully" });
//   } catch (error) {
//     console.error('Delete employee error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get single employee (optional - for future use)
// export const getSingleEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     res.status(200).json(employee);
//   } catch (error) {
//     console.error('Get single employee error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };


import Employee from "../models/Employee.js";

// Get all employees
export const getEmployee = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    // Filter based on status query parameter
    if (status === 'active') {
      query = {
        $or: [
          { leavingDate: { $exists: false } },
          { leavingDate: null },
          { leavingDate: { $gt: new Date() } }
        ]
      };
    } else if (status === 'inactive') {
      query = {
        leavingDate: { $exists: true, $ne: null, $lte: new Date() }
      };
    }
    
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new employee
export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      employeeID,
      address,
      basicSalary,
      commission,
      overtime,
      phoneNumber,
      advances,
      loans,
      cnic,
      joiningDate,
      leavingDate,
      jobTitle,
      netSalary,
      remainingAdvance,
      remainingLoan
    } = req.body;

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeID });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    // ✅ Initialize remainingAmount for advances
    const processedAdvances = (advances || []).map(adv => ({
      ...adv,
      remainingAmount: adv.remainingAmount !== undefined 
        ? adv.remainingAmount 
        : adv.amount
    }));

    // ✅ Initialize remainingAmount for loans
    const processedLoans = (loans || []).map(loan => ({
      ...loan,
      remainingAmount: loan.remainingAmount !== undefined 
        ? loan.remainingAmount 
        : loan.amount
    }));

    // Calculate totals
    const calculatedRemainingAdvance = processedAdvances.reduce(
      (sum, adv) => sum + (adv.remainingAmount || 0), 
      0
    );

    const calculatedRemainingLoan = processedLoans.reduce(
      (sum, loan) => sum + (loan.remainingAmount || 0), 
      0
    );

    const newEmployee = new Employee({
      name,
      employeeID,
      address,
      basicSalary,
      commission: commission || 0,
      overtime: overtime || 0,
      phoneNumber,
      advances: processedAdvances,
      loans: processedLoans,
      cnic,
      joiningDate,
      leavingDate: leavingDate || null,
      jobTitle,
      netSalary,
      remainingAdvance: calculatedRemainingAdvance,
      remainingLoan: calculatedRemainingLoan
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      employeeID,
      address,
      basicSalary,
      commission,
      overtime,
      phoneNumber,
      advances,
      loans,
      cnic,
      joiningDate,
      leavingDate,
      jobTitle,
      netSalary,
      remainingAdvance,
      remainingLoan
    } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if employeeID is being changed and if new ID already exists
    if (employeeID && employeeID !== employee.employeeID) {
      const existingEmployee = await Employee.findOne({ employeeID });
      if (existingEmployee) {
        return res.status(400).json({ message: "Employee ID already exists" });
      }
    }

    // ✅ Initialize remainingAmount for advances
    const processedAdvances = (advances || []).map(adv => ({
      ...adv,
      remainingAmount: adv.remainingAmount !== undefined 
        ? adv.remainingAmount 
        : adv.amount
    }));

    // ✅ Initialize remainingAmount for loans
    const processedLoans = (loans || []).map(loan => ({
      ...loan,
      remainingAmount: loan.remainingAmount !== undefined 
        ? loan.remainingAmount 
        : loan.amount
    }));

    // Calculate totals
    const calculatedRemainingAdvance = processedAdvances.reduce(
      (sum, adv) => sum + (adv.remainingAmount || 0), 
      0
    );

    const calculatedRemainingLoan = processedLoans.reduce(
      (sum, loan) => sum + (loan.remainingAmount || 0), 
      0
    );

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        name,
        employeeID,
        address,
        basicSalary,
        commission: commission || 0,
        overtime: overtime || 0,
        phoneNumber,
        advances: processedAdvances,
        loans: processedLoans,
        cnic,
        joiningDate,
        leavingDate: leavingDate || null,
        jobTitle,
        netSalary,
        remainingAdvance: calculatedRemainingAdvance,
        remainingLoan: calculatedRemainingLoan
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employee.findByIdAndDelete(id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single employee
export const getSingleEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Get single employee error:', error);
    res.status(500).json({ message: error.message });
  }
};
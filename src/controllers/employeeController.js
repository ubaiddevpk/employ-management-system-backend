// import Employee from "../models/Employee.js";

// // GET all employees
// export const getEmployee = async (req,res)=>{
//   const employees =await Employee.find();
//   res.json(employees)
// };

// //Add new employ

// export const addEmployee=async(req,res)=>{
//   const employee=await Employee.create(req.body);
//   res.status(201).json(employee);
// }

// export const updateEmployee = async (req, res) => {
//   const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   if (!updated) {
//     const error = new Error("Employee not found");
//     error.statusCode = 404;
//     throw error;
//   }
//   res.json(updated);
// };

// export const deleteEmployee = async (req, res) => {
//   const deleted = await Employee.findByIdAndDelete(req.params.id);
//   if (!deleted) {
//     const error = new Error("Employee not found");
//     error.statusCode = 404;
//     throw error;
//   }
//   res.json({ message: "Employee deleted successfully" });
// };

// controllers/employeeController.js
import Employee from "../models/Employee.js";

// Get all employees
export const getEmployee = async (req, res) => {
  try {
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    res.status(200).json(employees);
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

    // Calculate remaining amounts if not provided
    const calculatedRemainingAdvance = remainingAdvance || (advances || []).reduce((sum, adv) => {
      return sum + Math.max(0, (adv.amount || 0) - (adv.deduction || 0));
    }, 0);

    const calculatedRemainingLoan = remainingLoan || (loans || []).reduce((sum, loan) => {
      return sum + Math.max(0, (loan.amount || 0) - (loan.deduction || 0));
    }, 0);

    const newEmployee = new Employee({
      name,
      employeeID,
      address,
      basicSalary,
      commission: commission || 0,
      overtime: overtime || 0,
      phoneNumber,
      advances: advances || [],
      loans: loans || [],
      cnic,
      joiningDate,
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

    // Calculate remaining amounts if not provided
    const calculatedRemainingAdvance = remainingAdvance || (advances || []).reduce((sum, adv) => {
      return sum + Math.max(0, (adv.amount || 0) - (adv.deduction || 0));
    }, 0);

    const calculatedRemainingLoan = remainingLoan || (loans || []).reduce((sum, loan) => {
      return sum + Math.max(0, (loan.amount || 0) - (loan.deduction || 0));
    }, 0);

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
        advances: advances || [],
        loans: loans || [],
        cnic,
        joiningDate,
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

// Get single employee (optional - for future use)
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
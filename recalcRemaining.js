// recalcRemaining.js
import mongoose from "mongoose";
import Employee from "../backend/src/models/Employee.js"; // your employee model

const MONGO_URI = "mongodb+srv://obaidullahdeveloper_db_user:EY9G8xikzSphY2Lj@cluster0.a1uvwql.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

async function recalcRemaining() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB ✅");

  const employees = await Employee.find();

  for (const emp of employees) {
    // recalc advances
    emp.advances?.forEach(a => {
      a.remainingAmount = a.amount - (a.deduction || 0);
    });

    // recalc loans
    emp.loans?.forEach(l => {
      l.remainingAmount = l.amount - (l.deduction || 0);
    });

    // total remaining
    emp.remainingAdvance = emp.advances.reduce((sum, a) => sum + (a.remainingAmount || 0), 0);
    emp.remainingLoan = emp.loans.reduce((sum, l) => sum + (l.remainingAmount || 0), 0);

    await emp.save();
  }

  console.log("✅ All remaining amounts recalculated successfully.");
  await mongoose.disconnect();
}

recalcRemaining().catch(err => console.error(err));

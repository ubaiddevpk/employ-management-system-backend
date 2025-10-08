import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

// @desc    Login user
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  res.json(req.user);
};




// @desc    Create new user
// @route   POST /api/users
// @access  Public (for now)
export const createUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ Create user (password will be hashed by schema pre-save hook)
    const user = await User.create({
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id), // optional: auto login after creation
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




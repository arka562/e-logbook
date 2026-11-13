import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const registerUser = async (req, res) => {
    // Public registration must never decide its own role or log credentials.
    // Any `role` sent by the client is ignored on purpose: privilege
    // escalation via role: "admin" was possible here before this fix.
    // Admin / HOD / shift_incharge accounts are provisioned separately
    // (admin-controlled process / seeder), never through this endpoint.
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "Some fields are missing" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "operator",
      department
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id)
    });

};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id)
    });
};

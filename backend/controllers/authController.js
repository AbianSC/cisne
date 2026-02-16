const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const db = require("../models");
const User = db.User;

const signToken = (user) => {
  return jwt.sign(
    { id: user.Id_user, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password, role } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already in use." });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      role: role || "PATIENT"
    });

    return res.status(201).json({
      id: user.Id_user,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Error creating user." });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    const token = signToken(user);

    return res.json({
      token,
      user: { id: user.Id_user, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Login error." });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};

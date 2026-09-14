import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "combopoint_secret_key_123", {
    expiresIn: "30d"
  });
};

export const loginAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  const loginField = username || email;

  if (!loginField || !password) {
    return res.status(400).json({ success: false, message: "Please provide credentials and password" });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: loginField }, { email: loginField.toLowerCase() }]
    });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

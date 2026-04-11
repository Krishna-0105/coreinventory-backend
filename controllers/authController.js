
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import sendEmail from "../utils/sendEmail.js"
import crypto from "crypto"
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}


// ================= REGISTER USER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and include 1 uppercase letter, 1 number, and 1 special character"
      })
    }
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }
    const phoneExists = await User.findOne({ phone })

    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already registered" })
    }
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    })

  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    })
  }
}


// ================= LOGIN USER =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    })
  }
}


// ================= GET USER PROFILE =================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)

  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    })
  }
}


// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    // const resetToken = crypto.randomBytes(20).toString("hex")

    // user.resetPasswordToken = resetToken
    // user.resetPasswordExpire = Date.now() + 15 * 60 * 1000

    // await user.save({ validateBeforeSave: false })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
        const resetToken = crypto.randomBytes(20).toString("hex")

    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000

    await user.save({ validateBeforeSave: false })
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

    await sendEmail(
      email,
      "Password Reset Request",
      `Click the link to reset your password: ${resetLink}`
    )

    res.json({
      message: "Password reset email sent",
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Server error",
    })
  }
}
const resetPassword = async (req, res) => {
  try {
     console.log("TOKEN RECEIVED:", req.params.token)
  console.log("BODY:", req.body)
    const { password } = req.body
    const token = req.params.token
    console.log("DB TOKEN vs URL TOKEN:", token)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and include 1 uppercase letter, 1 number, and 1 special character",
      })
    }

    // ✅ Find user using token
    const user = await User.findOne({
      
      resetPasswordToken: token,
      
      resetPasswordExpire: { $gt: Date.now() },
    })
    console.log("USER FOUND:", user)

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      })
    }

    // ✅ Update password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    res.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Server error",
    })
  }
}

export {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword
}
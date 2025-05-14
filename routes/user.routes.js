// import { Router } from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import UserModel from "../models/user.model.js";

// const userRouter = Router();
// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// userRouter.post("/register", async (req, res) => {
//   try {
//     const { fullname, email, password, confirmPassword } = req.body;

//     // Validations
//     if (!fullname?.trim()) {
//       return res.status(400).json({ message: "Full name is required" });
//     }
//     if (!email?.trim()) {
//       return res.status(400).json({ message: "Email is required" });
//     }
//     if (!password) {
//       return res.status(400).json({ message: "Password is required" });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }
//     if (password.length < 8) {
//       return res.status(400).json({ 
//         message: "Password must be at least 8 characters" 
//       });
//     }

//     // Check if user exists
//     const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     // Hash password and save user
//     const hash = await bcrypt.hash(password, 12); // Increased salt rounds
//     const newUser = new UserModel({ 
//       fullname: fullname.trim(),
//       email: email.toLowerCase(),
//       password: hash 
//     });

//     await newUser.save();

//     // Remove password before sending response
//     const userResponse = newUser.toObject();
//     delete userResponse.password;

//     return res.status(201).json({ 
//       message: "User registered successfully",
//       user: userResponse
//     });
//   } catch (error) {
//     console.error("Registration error:", error);

//     // Handle duplicate key error separately
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     return res.status(500).json({ 
//       message: "Registration failed",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// });

// userRouter.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Basic validation
//     if (!email?.trim() || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     // Find user (case-insensitive email)
//     const user = await UserModel.findOne({ email: email.toLowerCase() })
//       .select('+password'); // Explicitly select password field

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { 
//         userId: user._id,
//         email: user.email
//       },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     // Prepare user data without sensitive information
//     const userData = {
//       id: user._id,
//       name: user.fullname,
//       email: user.email,
//       createdAt: user.createdAt
//     };

//     return res.status(200).json({
//       message: "Login successful",
//       token,
//       user: userData
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ 
//       message: "Login failed",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// });

// export default userRouter;


import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const userRouter = Router();
const key = process.env.JWT_SECRET;

userRouter.post("/register", async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const result = await UserModel.findOne({ email });
    if (result) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong, please try again" });
        }
        const newUser = new UserModel({
          fullname,
          email,
          password: hash,
        });
        await newUser.save();
        return res
          .status(201)
          .json({ message: "User registered successfully" });
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userId = user._id;
    const userName = user.fullname;
    const userEmail = user.email;
    const hash = user.password;

    bcrypt.compare(password, hash, async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong, please try again" });
      }
      if (result) {
        const token = jwt.sign({ userId, userName, userEmail }, key);
        return res
          .status(200)
          .json({
            message: "Login successful",
            token,
            userName,
            userId,
            userEmail,
          });
      } else {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;

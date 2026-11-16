
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@kaamflow.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "KaamFlow Admin",
      email,
      password: hashedPassword,
      role: "owner",
    });

    console.log("Admin account created successfully.");
    console.log("Email: admin@kaamflow.com");
    console.log("Password: Admin@123");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();

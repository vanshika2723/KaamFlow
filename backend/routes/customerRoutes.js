
const express = require("express");
const Customer = require("../models/Customer");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("owner", "service_desk"));

// Create customer
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, area, address } = req.body;

    if (!name || !phone || !area) {
      return res.status(400).json({
        message: "Name, phone and area are required.",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      area,
      address,
      business_id: req.user._id,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Customer created successfully.",
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({
      business_id: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one customer
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      business_id: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


const express = require("express");
const Asset = require("../models/Assets");
const Customer = require("../models/Customer");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("owner", "service_desk"));

// Create asset
router.post("/", async (req, res) => {
  try {
    const {
      customer_id,
      equipmentType,
      category,
      brand,
      model,
      serialNumber,
      location,
      visibleCondition,
      accessoriesReceived,
      customerConsent,
    } = req.body;

    if (!customer_id || !equipmentType) {
      return res.status(400).json({
        message: "Customer and equipment type are required.",
      });
    }

    const customer = await Customer.findOne({
      _id: customer_id,
      business_id: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    const asset = await Asset.create({
      customer_id,
      equipmentType,
      category,
      brand,
      model,
      serialNumber,
      location,
      visibleCondition,
      accessoriesReceived,
      customerConsent,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Equipment registered successfully.",
      asset,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assets for a customer
router.get("/customer/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      business_id: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const assets = await Asset.find({
      customer_id: customer._id,
    }).sort({ createdAt: -1 });

    res.json({ assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

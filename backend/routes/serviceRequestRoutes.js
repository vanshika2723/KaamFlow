
const express = require("express");
const crypto = require("crypto");

const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const Asset = require("../models/Assets");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("owner", "service_desk"));

// Create service request
router.post("/", async (req, res) => {
  try {
    const {
      customer_id,
      asset_id,
      reportedSymptom,
      urgency,
      preferredTime,
    } = req.body;

    if (!customer_id || !asset_id || !reportedSymptom) {
      return res.status(400).json({
        message: "Customer, equipment and reported symptom are required.",
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

    const asset = await Asset.findOne({
      _id: asset_id,
      customer_id: customer._id,
    });

    if (!asset) {
      return res.status(404).json({
        message: "Equipment not found for this customer.",
      });
    }

    const requestId =
      "KF-" +
      Date.now() +
      "-" +
      crypto.randomBytes(2).toString("hex").toUpperCase();

    const serviceRequest = await ServiceRequest.create({
      requestId,
      customer_id,
      asset_id,
      reportedSymptom,
      urgency,
      preferredTime,
      business_id: req.user._id,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Service request created successfully.",
      serviceRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all service requests
router.get("/", async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      business_id: req.user._id,
    })
      .populate("customer_id", "name phone area")
      .populate("asset_id", "equipmentType brand model")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

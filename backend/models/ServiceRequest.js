
const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    asset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    reportedSymptom: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    preferredTime: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "needs_review",
        "accepted",
        "needs_more_information",
        "out_of_coverage",
        "declined",
      ],
      default: "needs_review",
    },
    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);

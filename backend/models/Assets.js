
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    equipmentType: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    model: {
      type: String,
      trim: true,
      default: "",
    },
    serialNumber: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    visibleCondition: {
      type: String,
      trim: true,
      default: "",
    },
    accessoriesReceived: {
      type: [String],
      default: [],
    },
    customerConsent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);

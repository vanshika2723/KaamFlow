
const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["before_repair", "during_repair", "after_repair", "diagnosis", "other"],
      default: "other",
    },

    visibility: {
      type: String,
      enum: ["internal", "customer"],
      default: "internal",
    },

    caption: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ business_id: 1, job_id: 1 });

module.exports = mongoose.model("Evidence", evidenceSchema);

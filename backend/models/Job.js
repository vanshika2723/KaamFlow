
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    serviceRequest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
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

    business_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "diagnosis_pending",
        "diagnosis_in_progress",
        "diagnosis_completed",
        "waiting_for_approval",
        "approved",
        "in_repair",
        "waiting_for_parts",
        "ready_for_qc",
        "qc_failed",
        "qc_passed",
        "completed",
        "cancelled",
      ],
      default: "diagnosis_pending",
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        note: {
          type: String,
          default: "",
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ business_id: 1, status: 1 });

module.exports = mongoose.model("Job", jobSchema);

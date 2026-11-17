
const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
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

    observations: {
      type: String,
      required: true,
      trim: true,
    },

    suspectedCause: {
      type: String,
      required: true,
      trim: true,
    },

    diagnosisNotes: {
      type: String,
      default: "",
      trim: true,
    },

    testsPerformed: [
      {
        type: String,
        trim: true,
      },
    ],

    safetyLimitations: {
      type: String,
      default: "",
      trim: true,
    },

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

diagnosisSchema.index({ business_id: 1, job_id: 1 });

module.exports = mongoose.model("Diagnosis", diagnosisSchema);


const express = require("express");

const Diagnosis = require("../models/Diagnosis");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Save diagnosis
router.post(
  "/:jobId",
  authorize("owner", "technician"),
  async (req, res) => {
    try {
      const {
        observations,
        suspectedCause,
        diagnosisNotes,
        testsPerformed,
        safetyLimitations,
      } = req.body;

      if (!observations || !suspectedCause) {
        return res.status(400).json({
          message: "Observations and suspected cause are required.",
        });
      }

      const job = await Job.findOne({
        _id: req.params.jobId,
        business_id: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      if (
        req.user.role === "technician" &&
        String(job.assignedTechnician) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "You can only diagnose jobs assigned to you.",
        });
      }

      if (
        !["diagnosis_pending", "diagnosis_in_progress"].includes(job.status)
      ) {
        return res.status(400).json({
          message: "Diagnosis cannot be added at this job status.",
          currentStatus: job.status,
        });
      }

      const diagnosis = await Diagnosis.create({
        job_id: job._id,
        business_id: req.user._id,
        observations,
        suspectedCause,
        diagnosisNotes: diagnosisNotes || "",
        testsPerformed: Array.isArray(testsPerformed) ? testsPerformed : [],
        safetyLimitations: safetyLimitations || "",
        createdBy: req.user._id,
      });

      if (job.status === "diagnosis_pending") {
        job.status = "diagnosis_in_progress";
        job.statusHistory.push({
          status: "diagnosis_in_progress",
          note: "Diagnosis started.",
          changedBy: req.user._id,
        });

        await job.save();
      }

      res.status(201).json({
        message: "Diagnosis saved successfully.",
        diagnosis,
      });
    } catch (error) {
      console.error("Save Diagnosis Error:", error);

      res.status(500).json({
        message: "Failed to save diagnosis.",
        error: error.message,
      });
    }
  }
);

// Get diagnosis history for a job
router.get(
  "/:jobId",
  authorize("owner", "service_desk", "technician", "qc_reviewer"),
  async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.jobId,
        business_id: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      if (
        req.user.role === "technician" &&
        String(job.assignedTechnician) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Access denied.",
        });
      }

      const diagnoses = await Diagnosis.find({
        job_id: job._id,
        business_id: req.user._id,
      })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        count: diagnoses.length,
        diagnoses,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch diagnosis history.",
        error: error.message,
      });
    }
  }
);

// Mark diagnosis as completed
router.post(
  "/:jobId/complete",
  authorize("owner", "technician"),
  async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.jobId,
        business_id: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      if (
        req.user.role === "technician" &&
        String(job.assignedTechnician) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "You can only complete diagnosis for your assigned job.",
        });
      }

      if (job.status !== "diagnosis_in_progress") {
        return res.status(400).json({
          message: "Job must be in diagnosis progress before completion.",
          currentStatus: job.status,
        });
      }

      const diagnosisExists = await Diagnosis.exists({
        job_id: job._id,
        business_id: req.user._id,
      });

      if (!diagnosisExists) {
        return res.status(400).json({
          message: "Add at least one diagnosis record first.",
        });
      }

      job.status = "diagnosis_completed";

      job.statusHistory.push({
        status: "diagnosis_completed",
        note: "Diagnosis marked as completed.",
        changedBy: req.user._id,
      });

      await job.save();

      res.status(200).json({
        message: "Diagnosis completed successfully.",
        job,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to complete diagnosis.",
        error: error.message,
      });
    }
  }
);

module.exports = router;

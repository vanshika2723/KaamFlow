
const express = require("express");
const crypto = require("crypto");

const Job = require("../models/Job");
const ServiceRequest = require("../models/ServiceRequest");
const Diagnosis = require("../models/Diagnosis");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Allowed status transitions
const allowedTransitions = {
  diagnosis_pending: ["diagnosis_in_progress"],
  diagnosis_in_progress: ["diagnosis_completed"],
  diagnosis_completed: ["waiting_for_approval"],
  approved: ["in_repair"],
  in_repair: ["waiting_for_parts", "ready_for_qc"],
  waiting_for_parts: ["in_repair"],
  ready_for_qc: ["qc_passed", "qc_failed"],
  qc_failed: ["in_repair"],
  qc_passed: ["completed"],
};

// Create a Job from an existing Service Request
router.post(
  "/from-request/:requestId",
  authorize("owner", "service_desk"),
  async (req, res) => {
    try {
      const serviceRequest = await ServiceRequest.findOne({
        _id: req.params.requestId,
        business_id: req.user._id,
      });

      if (!serviceRequest) {
        return res.status(404).json({
          message: "Service Request not found.",
        });
      }

      if (
        ["declined", "out_of_coverage", "needs_more_information"].includes(
          serviceRequest.status
        )
      ) {
        return res.status(400).json({
          message: "This request cannot be converted into a Job yet.",
          currentStatus: serviceRequest.status,
        });
      }

      const existingJob = await Job.findOne({
        serviceRequest_id: serviceRequest._id,
        business_id: req.user._id,
      });

      if (existingJob) {
        return res.status(409).json({
          message: "A Job already exists for this Service Request.",
          job: existingJob,
        });
      }

      const jobNumber =
        `KF-JOB-${Date.now()}-${crypto
          .randomBytes(2)
          .toString("hex")
          .toUpperCase()}`;

      const job = await Job.create({
        jobNumber,
        serviceRequest_id: serviceRequest._id,
        customer_id: serviceRequest.customer_id,
        asset_id: serviceRequest.asset_id,
        business_id: req.user._id,
        status: "diagnosis_pending",
        statusHistory: [
          {
            status: "diagnosis_pending",
            note: "Job created from Service Request.",
            changedBy: req.user._id,
          },
        ],
        createdBy: req.user._id,
      });

      if (serviceRequest.status !== "accepted") {
        serviceRequest.status = "accepted";
        await serviceRequest.save();
      }

      res.status(201).json({
        message: "Job created successfully.",
        job,
      });
    } catch (error) {
      console.error("Create Job Error:", error);
      res.status(500).json({
        message: "Failed to create Job.",
        error: error.message,
      });
    }
  }
);

// Update Job Status
router.post(
  "/:id/status",
  authorize("owner", "service_desk", "technician", "qc_reviewer"),
  async (req, res) => {
    try {
      const { status: nextStatus, note } = req.body;

      if (!nextStatus || !note || !note.trim()) {
        return res.status(400).json({
          message: "New status and status change note are required.",
        });
      }

      const job = await Job.findOne({
        _id: req.params.id,
        business_id: req.user._id,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      // Technicians can only update their assigned jobs
      if (
        req.user.role === "technician" &&
        String(job.assignedTechnician) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "You can only update jobs assigned to you.",
        });
      }

      const currentStatus = job.status;

      const permittedNextStatuses =
        allowedTransitions[currentStatus] || [];

      if (!permittedNextStatuses.includes(nextStatus)) {
        return res.status(400).json({
          message: "This status transition is not allowed.",
          currentStatus,
          allowedNextStatuses: permittedNextStatuses,
        });
      }

      // Technician permissions
      if (
        req.user.role === "technician" &&
        ![
          "diagnosis_in_progress",
          "diagnosis_completed",
          "in_repair",
          "waiting_for_parts",
          "ready_for_qc",
        ].includes(nextStatus)
      ) {
        return res.status(403).json({
          message: "You are not authorized for this status transition.",
        });
      }

      // Service desk permissions
      if (
        req.user.role === "service_desk" &&
        !["diagnosis_in_progress", "waiting_for_approval"].includes(
          nextStatus
        )
      ) {
        return res.status(403).json({
          message: "Service Desk cannot perform this status transition.",
        });
      }

      // QC reviewer can only approve or fail QC
      if (
        req.user.role === "qc_reviewer" &&
        !["qc_passed", "qc_failed"].includes(nextStatus)
      ) {
        return res.status(403).json({
          message: "QC Reviewer can only update QC results.",
        });
      }

      // Diagnosis must exist before marking it completed
      if (nextStatus === "diagnosis_completed") {
        const diagnosis = await Diagnosis.findOne({
          job_id: job._id,
          business_id: req.user._id,
        });

        if (!diagnosis) {
          return res.status(400).json({
            message: "Add a diagnosis before completing diagnosis.",
          });
        }
      }

      // Update status and maintain audit history
      job.status = nextStatus;

      job.statusHistory.push({
        status: nextStatus,
        note: note.trim(),
        changedBy: req.user._id,
        changedAt: new Date(),
      });

      await job.save();

      res.status(200).json({
        message: "Job status updated successfully.",
        job,
      });
    } catch (error) {
      console.error("Update Job Status Error:", error);

      res.status(500).json({
        message: "Failed to update Job status.",
        error: error.message,
      });
    }
  }
);

// Get all Jobs for the logged-in business
router.get(
  "/",
  authorize("owner", "service_desk", "technician", "qc_reviewer"),
  async (req, res) => {
    try {
      const filter = {
        business_id: req.user._id,
      };

      if (req.user.role === "technician") {
        filter.assignedTechnician = req.user._id;
      }

      const jobs = await Job.find(filter)
        .populate("customer_id", "name phone")
        .populate("asset_id", "equipmentType brand model")
        .populate("serviceRequest_id", "requestId reportedSymptom urgency")
        .populate("assignedTechnician", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        count: jobs.length,
        jobs,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch Jobs.",
        error: error.message,
      });
    }
  }
);

// Get one Job by ID
router.get(
  "/:id",
  authorize("owner", "service_desk", "technician", "qc_reviewer"),
  async (req, res) => {
    try {
      const filter = {
        _id: req.params.id,
        business_id: req.user._id,
      };

      if (req.user.role === "technician") {
        filter.assignedTechnician = req.user._id;
      }

      const job = await Job.findOne(filter)
        .populate("customer_id")
        .populate("asset_id")
        .populate("serviceRequest_id")
        .populate("assignedTechnician", "name email")
        .populate("statusHistory.changedBy", "name email");

      if (!job) {
        return res.status(404).json({
          message: "Job not found.",
        });
      }

      res.status(200).json({ job });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch Job details.",
        error: error.message,
      });
    }
  }
);

module.exports = router;

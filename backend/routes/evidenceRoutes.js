
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Evidence = require("../models/Evidence");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "../uploads/evidence");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  },
});

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, WEBP and PDF files are allowed.")
      );
    }

    cb(null, true);
  },
});

router.use(protect);

// Upload evidence
router.post(
  "/:jobId",
  authorize("owner", "service_desk", "technician", "qc_reviewer"),
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a file to upload.",
        });
      }

      const job = await Job.findOne({
        _id: req.params.jobId,
        business_id: req.user._id,
      });

      if (!job) {
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          message: "Job not found.",
        });
      }

      if (
        req.user.role === "technician" &&
        String(job.assignedTechnician) !== String(req.user._id)
      ) {
        fs.unlinkSync(req.file.path);

        return res.status(403).json({
          message: "You can only upload evidence to your assigned jobs.",
        });
      }

      const { category, visibility, caption } = req.body;

      const evidence = await Evidence.create({
        job_id: job._id,
        business_id: req.user._id,
        uploadedBy: req.user._id,
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
        category: category || "other",
        visibility: visibility || "internal",
        caption: caption || "",
      });

      res.status(201).json({
        message: "Evidence uploaded successfully.",
        evidence: {
          ...evidence.toObject(),
          filePath: undefined,
        },
      });
    } catch (error) {
      console.error("Evidence Upload Error:", error);

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        message: "Failed to upload evidence.",
        error: error.message,
      });
    }
  }
);

// Get evidence for a job
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

      const evidence = await Evidence.find({
        job_id: job._id,
        business_id: req.user._id,
      })
        .populate("uploadedBy", "name email")
        .select("-filePath")
        .sort({ createdAt: -1 });

      res.status(200).json({
        count: evidence.length,
        evidence,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch evidence.",
        error: error.message,
      });
    }
  }
);

// Securely download evidence
router.get(
  "/:jobId/download/:evidenceId",
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

      const evidence = await Evidence.findOne({
        _id: req.params.evidenceId,
        job_id: job._id,
        business_id: req.user._id,
      });

      if (!evidence) {
        return res.status(404).json({
          message: "Evidence not found.",
        });
      }

      if (!fs.existsSync(evidence.filePath)) {
        return res.status(404).json({
          message: "Evidence file is missing from storage.",
        });
      }

      res.download(evidence.filePath, evidence.originalName);
    } catch (error) {
      res.status(500).json({
        message: "Failed to download evidence.",
        error: error.message,
      });
    }
  }
);

module.exports = router;

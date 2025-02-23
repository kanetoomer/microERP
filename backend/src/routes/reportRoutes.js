const express = require("express");
const {
  getFinancialReport,
  generatePDFReport,
  getUserReports,
  downloadReport,
  getRevenueForecast,
} = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getFinancialReport);
router.get("/generate-pdf", authMiddleware, generatePDFReport);
router.get("/list", authMiddleware, getUserReports);
router.get("/download/:reportId", authMiddleware, downloadReport);
router.get("/forecast", authMiddleware, getRevenueForecast);

module.exports = router;

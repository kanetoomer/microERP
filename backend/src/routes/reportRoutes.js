const express = require("express");
const { getFinancialReport } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getFinancialReport);

module.exports = router;

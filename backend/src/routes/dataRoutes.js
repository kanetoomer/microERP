const express = require("express");
const {
  addTransaction,
  getTransactions,
  uploadCSV,
  upload,
} = require("../controllers/dataController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", authMiddleware, addTransaction);
router.get("/", authMiddleware, getTransactions);
router.post("/upload", authMiddleware, upload.single("file"), uploadCSV);

module.exports = router;

const express = require("express");
const { uploadCSV, upload } = require("../controllers/dataController");
const {
  addTransaction,
  getTransactions,
} = require("../controllers/dataController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", authMiddleware, addTransaction);
router.get("/", authMiddleware, getTransactions);
router.post("/upload", authMiddleware, upload.single("file"), uploadCSV);

module.exports = router;

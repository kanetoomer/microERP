const multer = require("multer");
const Papa = require("papaparse");
const Transaction = require("../models/Transaction");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadCSV = async (req, res) => {
  try {
    console.log("🔹 File received:", req.file); // Log file details

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Convert buffer to string & log raw content
    const csvData = req.file.buffer.toString("utf-8");
    console.log("🔹 Raw CSV Data:", csvData);

    // Parse CSV
    const parsedData = Papa.parse(csvData, { header: true }).data;
    console.log("🔹 Parsed CSV Data:", parsedData);

    // Validate parsed data
    if (!parsedData.length)
      return res.status(400).json({ error: "Empty CSV file" });

    const transactions = parsedData
      .map((row) => {
        if (!row.type || !row.category || !row.amount) {
          console.log("⚠️ Skipping invalid row:", row);
          return null;
        }

        return {
          userId: req.user.id,
          type: row.type.trim().toLowerCase(),
          category: row.category.trim(),
          amount: parseFloat(row.amount),
          date: row.date ? new Date(row.date) : new Date(),
        };
      })
      .filter(Boolean); // Remove null entries

    if (!transactions.length)
      return res.status(400).json({ error: "Invalid data format" });

    await Transaction.insertMany(transactions);
    res
      .status(201)
      .json({ message: "CSV uploaded successfully", transactions });
  } catch (error) {
    console.error("❌ CSV Upload Error:", error);
    res.status(500).json({ error: "CSV upload failed" });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { type, category, amount } = req.body;

    // Ensure required fields are provided
    if (!type || !category || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transaction = new Transaction({
      userId: req.user.id,
      type,
      category,
      amount,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({ error: "Failed to add transaction" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({
        date: -1,
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ userId: req.user.id });
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

module.exports = { addTransaction, getTransactions, uploadCSV, upload };

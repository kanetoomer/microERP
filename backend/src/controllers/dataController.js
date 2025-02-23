const multer = require("multer");
const Papa = require("papaparse");
const Transaction = require("../models/Transaction");
const { generatePDFReport } = require("../controllers/reportController");

// Set up Multer for CSV uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add a new transaction (Income/Expense)
const addTransaction = async (req, res) => {
  try {
    const { type, category, amount, date } = req.body;
    const transaction = new Transaction({
      userId: req.user.id,
      type,
      category,
      amount,
      date: date ? new Date(date) : new Date(),
    });
    await transaction.save();

    res
      .status(201)
      .json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Failed to add transaction" });
  }
};

// Fetch all transactions for a user (With Pagination & Filtering)
const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
    } = req.query;
    const query = { userId: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate && endDate)
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Bulk Upload Transactions via CSV
const uploadCSV = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Parse CSV file
    const csvData = file.buffer.toString("utf-8");
    const parsedData = Papa.parse(csvData, { header: true }).data;

    // Validate and map transactions
    const transactions = parsedData
      .filter((row) => row.type && row.category && row.amount && row.date)
      .map((row) => ({
        userId: req.user.id,
        type: row.type.toLowerCase(),
        category: row.category,
        amount: parseFloat(row.amount),
        date: new Date(row.date),
      }));

    if (transactions.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid transactions found in CSV." });
    }

    // Save transactions to database
    await Transaction.insertMany(transactions);

    // Generate report without sending a response
    await generatePDFReport(req, res, true);

    // Send a response after everything is done
    res
      .status(201)
      .json({ message: "CSV uploaded and transactions saved successfully." });
  } catch (error) {
    console.error("CSV Upload Error:", error);
    res.status(500).json({ error: "Failed to process CSV file." });
  }
};

module.exports = { addTransaction, getTransactions, uploadCSV, upload };

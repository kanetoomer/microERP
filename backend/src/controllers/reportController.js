const Transaction = require("../models/Transaction");
const Report = require("../models/Report");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Get Key Financial Metrics
const getFinancialReport = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    res.json({ totalIncome, totalExpenses, netProfit });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

// Generate Timestamped PDF Report and Save to MongoDB
const generatePDFReport = async (req, res, internalCall = false) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({
      date: -1,
    });
    if (!transactions.length) {
      if (!internalCall)
        return res.status(400).json({ error: "No transactions found." });
      return;
    }

    // Generate timestamped filename
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "_");
    const filePath = path.join(
      __dirname,
      `../../reports/report_${timestamp}.pdf`
    );

    // Create a PDF document and write to file
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("Financial Report", { align: "center" });
    doc.moveDown();

    transactions.forEach((t) => {
      doc
        .fontSize(12)
        .text(
          `${t.date.toISOString().slice(0, 10)} - ${
            t.category
          } - ${t.type.toUpperCase()}: $${t.amount}`
        );
    });

    doc.end();

    // Wait for the PDF file to be completely written
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Save report in MongoDB
    const newReport = new Report({ userId: req.user.id, filePath });
    await newReport.save();

    if (!internalCall)
      res.json({
        message: "PDF report generated successfully",
        report: newReport,
      });
  } catch (error) {
    console.error("Error generating report:", error);
    if (!internalCall)
      res.status(500).json({ error: "Failed to generate report" });
  }
};

// Fetch All Reports for a User
const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// Serve Report File for Download
const downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    // Validate if reportId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      console.error("❌ Invalid ObjectId format:", reportId);
      return res.status(400).json({ error: "Invalid report ID" });
    }

    console.log("📌 Fetching report with ID:", reportId);
    const report = await Report.findById(reportId);
    if (!report) {
      console.error("❌ Report not found in MongoDB.");
      return res.status(404).json({ error: "Report not found" });
    }

    console.log("✅ Found report in DB:", report);
    if (!fs.existsSync(report.filePath)) {
      console.error("❌ File does not exist on the server:", report.filePath);
      return res
        .status(404)
        .json({ error: "File does not exist on the server" });
    }

    console.log("✅ File exists, preparing download:", report.filePath);
    res.download(report.filePath, (err) => {
      if (err) {
        console.error("❌ Error during download:", err);
        res.status(500).json({ error: "Error downloading the report" });
      } else {
        console.log("✅ Report downloaded successfully.");
      }
    });
  } catch (error) {
    console.error("❌ Critical Download Error:", error);
    res.status(500).json({ error: "Failed to download report" });
  }
};

// Predict Future Revenue using Moving Averages
const getRevenueForecast = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    if (!transactions.length) {
      return res.status(200).json([]); // No transactions found
    }
    // Aggregate monthly revenue
    const monthlyRevenue = {};
    transactions.forEach((t) => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyRevenue[month]) monthlyRevenue[month] = 0;
      if (t.type === "income") monthlyRevenue[month] += t.amount;
    });
    // Convert to array & sort by month
    const sortedRevenue = Object.keys(monthlyRevenue)
      .map((month) => ({
        month,
        revenue: monthlyRevenue[month],
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    if (sortedRevenue.length === 0) {
      return res.status(200).json([]); // No revenue data
    }
    // Apply Simple Moving Average (SMA) for forecasting
    const windowSize = 3; // 3-month moving average
    let forecast = [];
    for (let i = 0; i < sortedRevenue.length; i++) {
      if (i < windowSize - 1) continue;
      const sum = sortedRevenue
        .slice(i - (windowSize - 1), i + 1)
        .reduce((acc, val) => acc + val.revenue, 0);
      forecast.push({
        month: sortedRevenue[i].month,
        predictedRevenue: (sum / windowSize).toFixed(2), // Average of last 3 months
      });
    }
    res.json(forecast);
  } catch (error) {
    console.error("Error generating forecast:", error);
    res.status(500).json({ error: "Error generating forecast" });
  }
};

module.exports = {
  getFinancialReport,
  generatePDFReport,
  getUserReports,
  downloadReport,
  getRevenueForecast,
};

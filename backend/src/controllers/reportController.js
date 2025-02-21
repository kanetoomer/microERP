const Transaction = require("../models/Transaction");

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
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

module.exports = { getFinancialReport };

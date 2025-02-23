import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      const { data } = await api.get("/reports/");
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setError("Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // Listen for updates from CSV upload
    window.addEventListener("updateData", fetchReport);
    return () => window.removeEventListener("updateData", fetchReport);
  }, []);

  if (loading)
    return (
      <p className="text-center text-lg font-semibold">Loading Dashboard...</p>
    );

  if (!report) return <p className="text-center text-red-500">{error}</p>;

  const data = [
    { name: "Income", value: report.totalIncome },
    { name: "Expenses", value: report.totalExpenses },
    { name: "Net Profit", value: report.netProfit },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-green-100 p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-bold text-green-700">Total Income</h3>
          <p className="text-2xl text-green-900 font-semibold">
            ${report.totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-bold text-red-700">Total Expenses</h3>
          <p className="text-2xl text-red-900 font-semibold">
            ${report.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow-md text-center">
          <h3 className="text-lg font-bold text-blue-700">Net Profit</h3>
          <p className="text-2xl text-blue-900 font-semibold">
            ${report.netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3182CE" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;

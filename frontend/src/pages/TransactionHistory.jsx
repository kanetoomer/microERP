import { useEffect, useState } from "react";
import { api } from "../services/api";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Transactions from API
  const fetchTransactions = async () => {
    try {
      const { data } = await api.get(
        `/data?page=${page}&type=${filters.type}&category=${filters.category}&startDate=${filters.startDate}&endDate=${filters.endDate}`
      );
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    window.addEventListener("updateData", fetchTransactions);
    return () => window.removeEventListener("updateData", fetchTransactions);
  }, [page, filters]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Transaction History</h2>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 my-4">
        <select
          className="p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          className="p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          type="date"
          className="p-2 border rounded"
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <input
          type="date"
          className="p-2 border rounded"
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {/* Transactions Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <tr key={t._id} className="border text-center">
                <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-2">{t.category}</td>
                <td
                  className={`p-2 ${
                    t.type === "income" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {t.type}
                </td>
                <td className="p-2">${t.amount.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded mx-2"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-gray-300 rounded mx-2"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;

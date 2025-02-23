import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/reports/forecast",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data.");

        const data = await response.json();
        if (!data || data.length === 0) {
          setError("No forecast data available. Add transactions.");
        } else {
          setPredictions(data);
        }
      } catch (err) {
        setError("Failed to load forecast data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading)
    return (
      <p className="text-center text-lg font-semibold">Loading forecast...</p>
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Revenue Forecast</h2>

      {error ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-lg mt-4">
          <h3 className="text-lg font-semibold mb-4">Projected Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="predictedRevenue"
                stroke="#3182CE"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;

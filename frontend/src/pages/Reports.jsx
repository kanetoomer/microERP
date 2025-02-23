import { useEffect, useState } from "react";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // Utility: Delay for a given number of milliseconds
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Fetch Reports from API
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in.");
        return [];
      }
      const response = await fetch(
        "https://microerp.onrender.com/api/reports/list",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      return [];
    }
  };

  // Poll for a new report by checking the report count repeatedly
  const pollForNewReport = async (
    prevCount,
    maxAttempts = 10,
    interval = 2000
  ) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Polling attempt ${attempts}`);
      const data = await fetchReports();
      if (data.length > prevCount) {
        setMessage("Report generated successfully!");
        return;
      }
      await delay(interval);
    }
    setMessage("Report generation took too long. Please try again.");
  };

  // Generate a new report and then poll for the updated report list
  const handleGenerateReport = async () => {
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in.");
      setLoading(false);
      return;
    }

    const currentReports = await fetchReports();
    const prevCount = currentReports.length;

    try {
      const response = await fetch(
        "https://microerp.onrender.com/api/reports/generate-pdf",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      setMessage("Failed to generate report.");
      console.error("Error generating report:", error);
      setLoading(false);
      return;
    }

    // Poll for new report addition
    await pollForNewReport(prevCount);
    setLoading(false);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  // Handle Report Download
  const handleDownload = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in.");
        return;
      }
      const response = await fetch(
        `https://microerp.onrender.com/api/reports/download/${reportId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage("Failed to download report.");
      console.error("Error downloading report:", error);
    }
  };

  // Initial fetch of reports when component mounts
  useEffect(() => {
    fetchReports();
  }, []);

  // Simulate progress updates when "loading" changes
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 200);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 1000);
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Saved Reports</h2>
      {/* Generate Report Button */}
      <button
        onClick={handleGenerateReport}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-48"
        disabled={loading}
      >
        {loading ? `Generating... ${progress}%` : "Generate New Report"}
      </button>
      {message && <p className="mt-2 text-green-500">{message}</p>}
      {/* Report List */}
      <ul className="mt-4">
        <p className="text-sm mb-6 text-orange-600">
          May have to refresh browser
        </p>
        {reports.length > 0 ? (
          reports.map((report) => (
            <li
              key={report._id}
              className="flex justify-between bg-gray-100 p-2 rounded mb-2"
            >
              <span>{new Date(report.createdAt).toLocaleString()}</span>
              <button
                onClick={() => handleDownload(report._id)}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Download
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500 mt-4">
            No reports available. Generate a new report above.
          </p>
        )}
      </ul>
    </div>
  );
};

export default Reports;

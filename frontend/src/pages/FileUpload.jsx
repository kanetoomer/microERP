import { useState, useContext } from "react";
import { api } from "../services/api";
import AuthContext from "../context/AuthContext";

const FileUpload = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/data/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Upload successful! Transactions updated.");
      setFile(null);

      // Refresh Dashboard & Transaction History
      window.dispatchEvent(new Event("updateData"));
    } catch (error) {
      setMessage("Upload failed. Please check the CSV format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Upload CSV File</h2>
      {message && <p className="mt-2 text-green-500">{message}</p>}
      <form onSubmit={handleUpload} className="mt-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;

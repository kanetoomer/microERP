import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold mb-6">ERP Dashboard</h2>
        <nav className="space-y-4">
          <Link
            to="/dashboard"
            className="block py-2 px-4 bg-gray-800 rounded hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/upload"
            className="block py-2 px-4 bg-gray-800 rounded hover:bg-gray-700"
          >
            File Upload
          </Link>
          <Link
            to="/transactions"
            className="block py-2 px-4 bg-gray-800 rounded hover:bg-gray-700"
          >
            Transaction History
          </Link>
          <Link
            to="/reports"
            className="block py-2 px-4 bg-gray-800 rounded hover:bg-gray-700"
          >
            Reports
          </Link>
          <Link
            to="/analytics"
            className="block py-2 px-4 bg-gray-800 rounded hover:bg-gray-700"
          >
            Analytics
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white w-full py-2 rounded mt-6"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

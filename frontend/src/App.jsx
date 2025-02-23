import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import AuthContext, { AuthProvider } from "./context/AuthContext";
import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import FileUpload from "./pages/FileUpload";
import TransactionHistory from "./pages/TransactionHistory";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Route Wrapper to ensure only authenticated users access certain pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;
  return user ? children : <Navigate to="/" />;
};

const AppLayout = () => {
  const location = useLocation();
  const hideSidebarRoutes = ["/", "/register"];

  return (
    <div className="flex">
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
      <div
        className={`${
          hideSidebarRoutes.includes(location.pathname)
            ? "w-full"
            : "ml-64 w-full"
        } p-6`}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <FileUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;

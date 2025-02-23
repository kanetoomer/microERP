import { createContext, useState, useEffect } from "react";
import { api, setAuthToken } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session from localStorage when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && storedUser !== "undefined" && token) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthToken(token); // Ensure API requests include token
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Register function (Registers user and logs them in)
  const register = async (name, email, password) => {
    try {
      console.log("Registering user:", { name, email, password }); // Debugging log
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("Register response:", data); // Debugging log

      // Save user and token after successful registration
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Registration failed");
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Logging in with:", { email, password }); // Debugging log
      const { data } = await api.post("/auth/login", { email, password });

      console.log("Login response:", data); // Debugging log

      // Save user and token after successful login
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Login failed");
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
    window.location.href = "/"; // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

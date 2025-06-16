import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useState, useEffect, createContext, useContext, useMemo, useCallback, useRef } from "react";
import axios from "axios";

// Import your components
import AdminLogin from "./components/Admin/AdminLogin";
import AdminSignUp from "./components/Admin/AdminSignUp";
import AdminDashboard from "./components/Admin/AdminDashboard";
import EmployeeDashboard from "./components/Employees/EmployeeDashboard";
import Home from "./components/Admin/Home";
import Employee from "./components/Admin/Employee";
import Category from "./components/Admin/Category";
import ManageAdmin from "./components/Admin/ManageAdmin";
import AddCategory from "./components/Admin/AddCategory";
import AddEmployee from "./components/Admin/AddEmployee";
import EditEmployee from "./components/Admin/EditEmployee";
import EmployeeLogin from "./components/Employees/EmployeeLogin";
import EmployeeSignup from "./components/Employees/EmployeeSignUp";
import EmployeeDetail from "./components/Employees/EmployeeDetail";
import Office from "./components/Admin/Office";
import AdminProjects from "./components/PMT/AdminProjects";
import AdminTasks from "./components/PMT/AdminTasks";
import Clients from "./components/PMT/Clients";
// Add this import at the top with your other imports
import RoleSelectionPage from "./components/RoleSelectionPage";

// Move apiUrl outside the component for stable reference
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Constants for role management
const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    role: null,
    loading: true,
  });

  // Use ref to prevent multiple simultaneous calls
  const isVerifying = useRef(false);
  const hasVerified = useRef(false);

  // Define verifyAuth as a stable function using useCallback
  const verifyAuth = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isVerifying.current) {
      console.log("Auth verification already in progress, skipping...");
      return;
    }

    // If already verified and authenticated, skip
    if (hasVerified.current && auth.isAuthenticated) {
      console.log("Already authenticated, skipping verification...");
      return;
    }

    isVerifying.current = true;
    
    try {
      console.log("Initiating auth verification...");
      const response = await axios.get(`${apiUrl}/verify`, {
        withCredentials: true, // This ensures cookies are sent
      });
      
      console.log("/api/verify response:", response.data);
      
      setAuth({
        isAuthenticated: !!response.data.Status,
        user: response.data.user || null,
        role: response.data.role || null,
        loading: false,
      });

      hasVerified.current = true;
    } catch (error) {
      console.error("Auth verification failed:", error);
      
      setAuth({
        isAuthenticated: false,
        user: null,
        role: null,
        loading: false,
      });

      hasVerified.current = true;
    } finally {
      isVerifying.current = false;
    }
  }, []); // Empty dependency array since we don't want this to change

  // Only run verifyAuth once on mount
  useEffect(() => {
    if (!hasVerified.current) {
      verifyAuth();
    }
  }, []); // Empty dependency array to run only once

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    auth,
    setAuth,
    verifyAuth
  }), [auth, verifyAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being verified
  if (auth.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/adminlogin" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Unauthorized component
const Unauthorized = () => (
  <div className="container mt-5">
    <div className="alert alert-danger">
      <h4>Unauthorized Access</h4>
      <p>You don't have permission to access this page.</p>
    </div>
  </div>
);

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RoleSelectionPage />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/adminsignup" element={<AdminSignUp />} />
          <Route path="/employeelogin" element={<EmployeeLogin />} />
          <Route path="/employeesignup" element={<EmployeeSignup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Employee Routes */}
          <Route 
            path="/employeedashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.ADMIN]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard with Nested Routes */}
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="employee" element={<Employee />} />
            <Route path="category" element={<Category />} />
            <Route path="manageadmin" element={<ManageAdmin />} />
            <Route path="add_category" element={<AddCategory />} />
            <Route path="add_employee" element={<AddEmployee />} />
            <Route path="edit_employee/:id" element={<EditEmployee />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="clients" element={<Clients />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="officeaddress" element={<Office />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  );
}

export { AuthContext };
export default App;
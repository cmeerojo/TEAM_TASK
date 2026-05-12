import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ProfilePage from "./pages/ProfilePage";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED AREA */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />

          {/* EMPLOYEE */}
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
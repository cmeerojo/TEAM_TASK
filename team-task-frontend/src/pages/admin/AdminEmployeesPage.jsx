import { useEffect, useState } from "react";
import api from "../../api/axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

import {
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Box,
  Chip,
  Drawer,
} from "@mui/material";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [open, setOpen] = useState(false);

  // Normalize avatar to an absolute URL so Avatar src works everywhere
  const buildAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/")) return `${BASE_URL}${avatar}`;
    return `${BASE_URL}/storage/${avatar}`;
  };

  const normalizeEmployee = (emp) => ({
    ...emp,
    avatar_url: buildAvatarUrl(emp.avatar_url || emp.avatar || emp.profile_picture || null),
  });

  // LOAD EMPLOYEES (FIXED)
  const fetchEmployees = async () => {
    const res = await api.get("/users");

    // ensure same structure everywhere
    const cleaned = res.data.map(normalizeEmployee);

    // For users missing an avatar in the list response, call the profile
    // endpoint to fetch the full user data (this is a small N+1 tradeoff)
    const enriched = await Promise.all(
      cleaned.map(async (emp) => {
        if (emp.avatar_url) return emp;

        try {
          const prof = await api.get(`/profile/${emp.id}`);
          return normalizeEmployee({ ...emp, ...prof.data });
        } catch (err) {
          return emp;
        }
      })
    );

    setEmployees(enriched);

    // Debug: log cleaned employees so we can inspect avatar_url values
    // Open the browser console to view these when the page loads
    // eslint-disable-next-line no-console
    console.log("AdminEmployeesPage - employees:", enriched);
    // eslint-disable-next-line no-console
    console.table(
      enriched.map((e) => ({ id: e.id, name: e.name, avatar_url: e.avatar_url }))
    );
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // OPEN DETAILS (already correct endpoint)
  const handleOpen = async (employee) => {
    const res = await api.get(`/profile/${employee.id}`);

    setSelectedEmployee(normalizeEmployee(res.data));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  
  const getAvatarSrc = (avatarUrl) => avatarUrl || undefined;

  const formatLabel = (value) => {
    if (!value) return "";
    return String(value)
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusBadge = (status) => {
    const base = {
      display: "inline-block",
      px: 2,
      py: 0.5,
      borderRadius: 2,
      fontSize: 12,
      fontWeight: "bold",
    };

    switch (status) {
      case "completed":
        return {
          label: "Completed",
          sx: { ...base, backgroundColor: "#d1fae5", color: "#065f46" },
        };
      case "in progress":
      case "in_progress":
        return {
          label: "In Progress",
          sx: { ...base, backgroundColor: "#dbeafe", color: "#1e40af" },
        };
      default:
        return {
          label: status ? formatLabel(status) : "Pending",
          sx: { ...base, backgroundColor: "#fef3c7", color: "#92400e" },
        };
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Employees
          </Typography>
          <Typography color="text.secondary" variant="body2">
            View employee profiles and task assignments.
          </Typography>
        </Box>

        {/* EMPLOYEE GRID */}
        <Grid container spacing={3}>
        {employees.map((emp) => (
          <Grid item xs={12} md={4} key={emp.id}>
            <Card
              onClick={() => handleOpen(emp)}
              sx={{
                cursor: "pointer",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                  {/*GRID AVATAR */}
                  <Avatar src={emp.avatar_url || undefined}>
                    {emp.name?.charAt(0)}
                  </Avatar>

                  <Box>
                    <Typography variant="h6">
                      {emp.name}
                    </Typography>

                    <Typography variant="body2">
                      {emp.email}
                    </Typography>
                  </Box>

                </Box>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* EMPLOYEE DETAIL DRAWER */}
      <Drawer anchor="right" open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: "16px 0 0 16px", width: { xs: "100%", sm: 380 } } }}>
        <Box sx={{ p: 4, height: "100%", overflowY: "auto" }}>

          {selectedEmployee && (
            <>
              {/* HEADER */}
              <Box sx={{ textAlign: "center" }}>

                {/*DRAWER AVATAR */}
                <Avatar
                  src={selectedEmployee.avatar_url || undefined}
                  sx={{ width: 80, height: 80, mx: "auto" }}
                >
                  {selectedEmployee.name?.charAt(0)}
                </Avatar>

                <Typography variant="h6" sx={{ mt: 2 }}>
                  {selectedEmployee.name}
                </Typography>

                <Typography variant="body2">
                  {selectedEmployee.email}
                </Typography>

                <Chip
                  label={formatLabel(selectedEmployee.role)}
                  sx={{ mt: 1 }}
                  color="primary"
                />
              </Box>

              {/* STATS */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">
                  Task Stats
                </Typography>

                <Typography>
                  Total: {selectedEmployee.task_count}
                </Typography>

                <Typography>
                  Pending: {selectedEmployee.pending_count}
                </Typography>

                <Typography>
                  In Progress: {selectedEmployee.in_progress_count}
                </Typography>

                <Typography>
                  Completed: {selectedEmployee.completed_count}
                </Typography>
              </Box>

              {/* TASK LIST */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">
                  Assigned Tasks
                </Typography>

                {selectedEmployee.tasks?.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      p: 1,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Typography variant="body2">
                      {task.title}
                    </Typography>

                    <Box sx={{ mt: 0.5, ...getStatusBadge(task.status).sx }}>
                      {getStatusBadge(task.status).label}
                    </Box>
                  </Box>
                ))}
              </Box>

            </>
          )}

        </Box>
      </Drawer>

    </Box>
    </Box>
  );
}
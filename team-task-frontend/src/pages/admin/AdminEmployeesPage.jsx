import { useEffect, useState } from "react";
import api from "../../api/axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

import {
  Container,
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

  // Avatar src is already normalized on load — just use it directly
  const getAvatarSrc = (avatarUrl) => avatarUrl || undefined;

  // Capitalize first letter for role badges
  const capitalize = (s) => {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Employees
      </Typography>

      {/* EMPLOYEE GRID */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {employees.map((emp) => (
          <Grid item xs={12} md={4} key={emp.id}>
            <Card
              onClick={() => handleOpen(emp)}
              sx={{ cursor: "pointer" }}
            >
              <CardContent>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                  {/* 🔥 GRID AVATAR FIXED */}
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
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 350, p: 3 }}>

          {selectedEmployee && (
            <>
              {/* HEADER */}
              <Box sx={{ textAlign: "center" }}>

                {/* 🔥 DRAWER AVATAR FIXED */}
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
                  label={capitalize(selectedEmployee.role)}
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

                    <Chip
                      label={task.status}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
              </Box>

            </>
          )}

        </Box>
      </Drawer>

    </Container>
  );
}
import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Divider,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tasksRes = await api.get("/tasks");
      const employeesRes = await api.get("/employees");

      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      await api.post("/tasks", {
        title,
        description,
        users: selectedUsers,
      });

      setTitle("");
      setDescription("");
      setSelectedUsers([]);

      fetchData();
    } catch (err) {
      console.log(err);
      alert("Failed to create task");
    }
  };

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status !== "completed").length;

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
          label: "Pending",
          sx: { ...base, backgroundColor: "#fef3c7", color: "#92400e" },
        };
    }
  };

  const cards = [
    { title: "Total Tasks", value: tasks.length, icon: <AssignmentIcon sx={{ fontSize: 40 }} /> },
    { title: "Employees", value: employees.length, icon: <GroupIcon sx={{ fontSize: 40 }} /> },
    { title: "Completed", value: completedTasks, icon: <CheckCircleIcon sx={{ fontSize: 40 }} /> },
    { title: "Pending", value: pendingTasks, icon: <PendingActionsIcon sx={{ fontSize: 40 }} /> },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Box sx={{ width: "100%", maxWidth: "1100px", p: 3 }}>

        {/* HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Manage tasks and employees efficiently.
          </Typography>
        </Box>

        {/* STATS */}
        <Grid container spacing={4} sx={{ mb: 5 }} justifyContent="center">
          {cards.map((card, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary">{card.title}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                        {card.value}
                      </Typography>
                    </Box>
                    {card.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CREATE TASK */}
        <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>

          {/* HEADER + BUTTON */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Create Task
            </Typography>

            <Button variant="contained" onClick={handleCreateTask}>
              Create Task
            </Button>
          </Box>

          <Grid container spacing={2}>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            {/* 🔥 FIXED: ULTRA WIDE DROPDOWN MENU ONLY */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign Employees</InputLabel>

                <Select
                  multiple
                  value={selectedUsers}
                  onChange={(e) => setSelectedUsers(e.target.value)}
                  label="Assign Employees"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        minWidth: "700px",   // 🔥 wide dropdown menu
                        maxWidth: "900px",
                      },
                    },
                  }}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? "Select employees"
                      : employees
                          .filter((u) => selected.includes(u.id))
                          .map((u) => u.name)
                          .join(", ")
                  }
                >
                  {employees.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>

              </FormControl>
            </Grid>

          </Grid>
        </Paper>

        {/* TASK TABLE */}
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Recent Tasks
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>

                    <TableCell>
                      <Box sx={getStatusBadge(task.status).sx}>
                        {getStatusBadge(task.status).label}
                      </Box>
                    </TableCell>

                    <TableCell>
                      {task.users?.map((u) => u.name).join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>

        </Paper>

      </Box>
    </Box>
  );
}
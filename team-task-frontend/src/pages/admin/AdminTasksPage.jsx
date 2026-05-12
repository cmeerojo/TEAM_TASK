import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

// 🔥 ICONS
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const taskRes = await api.get("/tasks");
    const userRes = await api.get("/users");

    setTasks(taskRes.data);
    setEmployees(userRes.data);
  };

  const handleOpen = (task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssignedUsers(task.users.map((u) => u.id));
    setStatus(task.status);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
  };

  const handleUpdate = async () => {
    await api.patch(`/tasks/${selectedTask.id}`, {
      title,
      description,
      users: assignedUsers,
      status,
    });

    handleClose();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    await api.delete(`/tasks/${id}`);
    fetchData();
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
          label: "Pending",
          sx: { ...base, backgroundColor: "#fef3c7", color: "#92400e" },
        };
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Manage Tasks
      </Typography>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>

          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
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

                <TableCell>{task.creator?.name}</TableCell>

                {/* 🔥 PILL BUTTONS */}
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>

                    {/* EDIT PILL */}
                    <Button
                      onClick={() => handleOpen(task)}
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{
                        borderRadius: "50px",
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        backgroundColor: "#3b82f6",
                        "&:hover": {
                          backgroundColor: "#2563eb",
                        },
                      }}
                    >
                      Edit
                    </Button>

                    {/* DELETE PILL */}
                    <Button
                      onClick={() => handleDelete(task.id)}
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderRadius: "50px",
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        backgroundColor: "#ef4444",
                        "&:hover": {
                          backgroundColor: "#dc2626",
                        },
                      }}
                    >
                      Delete
                    </Button>

                  </Box>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* MODAL */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography>Edit Task</Typography>

          <TextField
            fullWidth
            sx={{ mt: 2 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            fullWidth
            sx={{ mt: 2 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* STATUS */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          {/* EMPLOYEES */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assign Employees</InputLabel>
            <Select
              multiple
              value={assignedUsers}
              onChange={(e) => setAssignedUsers(e.target.value)}
            >
              {employees.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button sx={{ mt: 2 }} variant="contained" onClick={handleUpdate}>
            Save
          </Button>

        </Box>
      </Modal>

    </Container>
  );
}
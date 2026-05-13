import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
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
  ButtonGroup,
  Avatar,
  Stack,
} from "@mui/material";

// 🔥 ICONS
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("adminTaskViewMode") || "list";
  });
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [status, setStatus] = useState("");
  const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("adminTaskViewMode", viewMode);
  }, [viewMode]);

  const fetchData = async () => {
    const taskRes = await api.get("/tasks");
    const userRes = await api.get("/users");

    setTasks(taskRes.data);
    setEmployees(userRes.data);
  };

  const normalizeStatus = (value) => {
    if (!value) return "pending";
    if (value === "in progress") return "in_progress";
    return value;
  };

  const handleOpen = (task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssignedUsers(task.users.map((u) => u.id));
    setStatus(normalizeStatus(task.status));
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

  const handleDropStatus = async (nextStatus) => {
    if (!draggedTaskId) return;

    const draggedTask = tasks.find((task) => task.id === draggedTaskId);
    if (!draggedTask) return;

    if (normalizeStatus(draggedTask.status) === nextStatus) {
      setDraggedTaskId(null);
      return;
    }

    try {
      const res = await api.patch(`/tasks/${draggedTaskId}/status`, {
        status: nextStatus,
      });

      const updatedTask = res.data;
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    } catch (error) {
      console.error("Failed to update task status", error);
      fetchData();
    } finally {
      setDraggedTaskId(null);
    }
  };

  const buildAvatarUrl = (avatar) => {
    if (!avatar) return undefined;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/")) return `${BASE_URL}${avatar}`;
    return `${BASE_URL}/storage/${avatar}`;
  };

  const getUserAvatar = (user) => {
    if (!user) return undefined;
    const raw =
      user.avatar_url ||
      user.avatar ||
      user.profile_picture ||
      user.image ||
      null;
    return buildAvatarUrl(raw);
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

  const renderAssignedUsers = (users, avatarSize = 24, textVariant = "body2") => (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {users?.length ? (
        users.map((member) => (
          <Stack key={member.id} direction="row" spacing={0.75} alignItems="center">
            <Avatar src={getUserAvatar(member)} sx={{ width: avatarSize, height: avatarSize }}>
              {member.name?.charAt(0)}
            </Avatar>
            <Typography variant={textVariant}>{member.name}</Typography>
          </Stack>
        ))
      ) : (
        <Typography variant={textVariant} color="text.secondary">
          —
        </Typography>
      )}
    </Stack>
  );

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh", overflowX: "hidden" }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto", width: "100%", overflowX: "hidden" }}>
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Manage Tasks
            </Typography>
            <Typography color="text.secondary" variant="body2">
              View and edit all tasks assigned to your team.
            </Typography>
          </Box>

          <ButtonGroup variant="outlined" aria-label="task view mode">
            <Button
              variant={viewMode === "list" ? "contained" : "outlined"}
              onClick={() => setViewMode("list")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              List View
            </Button>
            <Button
              variant={viewMode === "columns" ? "contained" : "outlined"}
              onClick={() => setViewMode("columns")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Column View
            </Button>
          </ButtonGroup>
        </Box>

        {viewMode === "list" ? (
          /* TABLE */
          <Paper sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: "#f8fafc" }}>
                <TableRow sx={{ borderBottom: "2px solid #e2e8f0" }}>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} sx={{ borderBottom: "1px solid #f1f5f9", "&:hover": { background: "#f8fafc" } }}>

                <TableCell>{task.title}</TableCell>

                <TableCell>
                  <Box sx={getStatusBadge(task.status).sx}>
                    {getStatusBadge(task.status).label}
                  </Box>
                </TableCell>

                <TableCell>{renderAssignedUsers(task.users)}</TableCell>

                <TableCell>{task.creator?.name}</TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      onClick={() => handleOpen(task)}
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#3b82f6",
                        color: "#3b82f6",
                        "&:hover": {
                          background: "#eff6ff",
                          borderColor: "#2563eb",
                        },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(task.id)}
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        "&:hover": {
                          background: "#fef2f2",
                          borderColor: "#dc2626",
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
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {[
              { status: "pending", label: "Pending" },
              { status: "in_progress", label: "In Progress" },
              { status: "completed", label: "Completed" },
            ].map((column) => {
              const columnTasks = tasks.filter(
                (task) => normalizeStatus(task.status) === column.status,
              );

              return (
                <Paper
                  key={column.status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropStatus(column.status)}
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    backgroundColor: "#f8fafc",
                    p: 2,
                    minHeight: 520,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {column.label}
                    </Typography>
                    <Box
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 2,
                        backgroundColor: "#e2e8f0",
                        color: "#334155",
                      }}
                    >
                      {columnTasks.length}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {columnTasks.map((task) => (
                      <Paper
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(task.id));
                          setDraggedTaskId(task.id);
                        }}
                        onDragEnd={() => setDraggedTaskId(null)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                          cursor: "grab",
                          backgroundColor: "white",
                          "&:active": { cursor: "grabbing" },
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                          {task.title}
                        </Typography>
                        {task.description ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {task.description}
                          </Typography>
                        ) : null}

                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ color: "#475569", display: "block", mb: 0.75 }}>
                            Assigned:
                          </Typography>
                          {renderAssignedUsers(task.users, 22, "caption")}
                        </Box>
                        <Typography variant="caption" sx={{ color: "#475569", display: "block", mb: 1.5 }}>
                          Created by: {task.creator?.name || "Unknown"}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            onClick={() => handleOpen(task)}
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              borderColor: "#3b82f6",
                              color: "#3b82f6",
                              "&:hover": {
                                background: "#eff6ff",
                                borderColor: "#2563eb",
                              },
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(task.id)}
                            variant="outlined"
                            size="small"
                            startIcon={<DeleteIcon />}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              "&:hover": {
                                background: "#fef2f2",
                                borderColor: "#dc2626",
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Paper>
                    ))}

                    {columnTasks.length === 0 ? (
                      <Box
                        sx={{
                          border: "1px dashed #cbd5e1",
                          borderRadius: 2,
                          p: 2,
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: 14,
                        }}
                      >
                        No tasks here yet.
                      </Box>
                    ) : null}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* MODAL */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 450 },
              bgcolor: "white",
              p: 4,
              borderRadius: 3,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Edit Task</Typography>

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
      </Box>
    </Box>
  );
}
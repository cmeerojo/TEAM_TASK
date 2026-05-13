import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Grid,
  Chip,
  Avatar,
  Stack,
  Paper,
  ButtonGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("employeeTaskViewMode") || "list";
  });
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchTasks = async () => {
    const res = await api.get(`/my-tasks/${user.id}`);
    setTasks(res.data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem("employeeTaskViewMode", viewMode);
  }, [viewMode]);

  const updateStatus = useCallback(async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    fetchTasks();
  }, []);

  const normalizeStatus = (value) => {
    if (!value) return "pending";
    if (value === "in progress") return "in_progress";
    return value;
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
      fetchTasks();
    } finally {
      setDraggedTaskId(null);
    }
  };

  const getNextStatus = useCallback((status) => {
    if (status === "pending") return "in_progress";
    if (status === "in_progress") return "completed";
    return "completed";
  }, []);

  // 🔥 CLEAN DISPLAY TEXT (removes underscore)
  const formatStatus = (status) => {
    if (!status) return "Pending";
    return status
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const buildAvatarUrl = (avatar) => {
    if (!avatar) return undefined;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/")) return `${BASE_URL}${avatar}`;
    return `${BASE_URL}/storage/${avatar}`;
  };

  const getCreatorAvatar = (creator) => {
    if (!creator) return undefined;
    const raw =
      creator.avatar_url ||
      creator.avatar ||
      creator.profile_picture ||
      creator.image ||
      null;
    return buildAvatarUrl(raw);
  };

  const statusStyles = {
    completed: { bgcolor: "#d1fae5", color: "#065f46" },
    in_progress: { bgcolor: "#dbeafe", color: "#1e40af" },
    pending: { bgcolor: "#fef3c7", color: "#92400e" },
  };

  const StatusChip = ({ status }) => {
    const key = status || "pending";
    const s = statusStyles[key] || statusStyles.pending;
    return (
      <Chip
        label={formatStatus(key)}
        size="small"
        sx={{ fontWeight: 700, ...s }}
      />
    );
  };

  // 🔥 SAME BADGE STYLE AS ADMIN
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
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto", width: "100%" }}>
        {/* HEADER WITH VIEW TOGGLE */}
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
              My Tasks
            </Typography>
            <Typography color="text.secondary" variant="body2">
              View and manage your assigned tasks.
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

        {tasks.length === 0 && (
          <Typography sx={{ mt: 2 }}>No tasks assigned to you.</Typography>
        )}

        {viewMode === "list" ? (
          <Grid container spacing={2}>
          {tasks.map((task) => {
            const next = getNextStatus(task.status);
            const isCompleted = task.status === "completed";

            return (
              <Grid item xs={12} md={6} lg={4} key={task.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flex: "1 1 auto" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="h6">{task.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {task.description}
                        </Typography>
                      </Box>

                      <Box>
                        <StatusChip status={task.status} />
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                      <Avatar
                        src={getCreatorAvatar(task.creator)}
                        sx={{ width: 28, height: 28 }}
                      >
                        {task.creator?.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{task.creator?.name}</Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Team: {task.users?.map((u) => u.name).join(", ") || "—"}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => updateStatus(task.id, next)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? "Completed" : `Move to ${formatStatus(next)}`}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
          </Grid>
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

                        <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                          Created by: {task.creator?.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#475569", display: "block", mb: 1.5 }}>
                          Team: {task.users?.map((u) => u.name).join(", ") || "—"}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => updateStatus(task.id, getNextStatus(task.status))}
                            disabled={task.status === "completed"}
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
                            {task.status === "completed" ? "Done" : "Next"}
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
      </Box>
    </Box>
  );
}
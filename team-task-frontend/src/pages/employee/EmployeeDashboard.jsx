import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Container,
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
} from "@mui/material";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchTasks = async () => {
    const res = await api.get(`/my-tasks/${user.id}`);
    setTasks(res.data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = useCallback(async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    fetchTasks();
  }, []);

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
    <Container>
      <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
        My Tasks
      </Typography>

      {tasks.length === 0 && (
        <Typography sx={{ mt: 2 }}>No tasks assigned to you.</Typography>
      )}

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
    </Container>
  );
}
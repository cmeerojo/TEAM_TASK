import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Stack,
} from "@mui/material";
import { getUser, logout } from "../auth/auth";

export default function AppLayout() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* NAVBAR */}
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 1 }}>

          {/* LEFT: BRAND */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "white",
                fontSize: "20px",
              }}
            >
              T
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Task Manager
            </Typography>
          </Box>

          {/* CENTER NAV */}
          <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1, justifyContent: "center", mx: 2 }}>

            {user?.role === "admin" ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => goTo("/admin")}
                  sx={{
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Dashboard
                </Button>

                <Button
                  color="inherit"
                  onClick={() => goTo("/admin/tasks")}
                  sx={{
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Tasks
                </Button>

                <Button
                  color="inherit"
                  onClick={() => goTo("/admin/employees")}
                  sx={{
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Employees
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={() => goTo("/employee")}
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: "rgba(255,255,255,0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                My Tasks
              </Button>
            )}

          </Box>

          {/* RIGHT: PROFILE */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>

            <Avatar
              src={user?.avatar_url}
              sx={{
                width: 36,
                height: 36,
                border: "2px solid rgba(255,255,255,0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  border: "2px solid rgba(255,255,255,0.6)",
                },
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>

            <Button
              color="inherit"
              onClick={() => goTo("/profile")}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(255,255,255,0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {user?.name}
            </Button>

            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                py: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(255,255,255,0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Logout
            </Button>

          </Stack>

        </Toolbar>
      </AppBar>

      {/* PAGE CONTENT */}
      <Box
  sx={{
    p: 3,
    minHeight: "calc(100vh - 64px)",
    background: "#f8fafc",
  }}
>
        <Outlet />
      </Box>
    </>
  );
}
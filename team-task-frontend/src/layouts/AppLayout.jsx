import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
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
      <AppBar position="static">
        <Toolbar>

          {/* LEFT: BRAND */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Team Task Manager
          </Typography>

          {/* CENTER NAV */}
          <Box sx={{ display: "flex", gap: 2, flexGrow: 1 }}>

            {user?.role === "admin" ? (
              <>
                <Button color="inherit" onClick={() => goTo("/admin")}>
                  Dashboard
                </Button>

                <Button color="inherit" onClick={() => goTo("/admin/tasks")}>
                  Tasks
                </Button>

                <Button color="inherit" onClick={() => goTo("/admin/employees")}>
                  Employees
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={() => goTo("/employee")}>
                My Tasks
              </Button>
            )}

          </Box>

          {/* RIGHT: PROFILE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

            <Avatar src={user?.avatar_url}>
              {user?.name?.charAt(0)}
            </Avatar>

           <Button
  color="inherit"
  onClick={() => goTo("/profile")}
  sx={{ textTransform: "none" }}
>
  {user?.name}
</Button>

            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>

          </Box>

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
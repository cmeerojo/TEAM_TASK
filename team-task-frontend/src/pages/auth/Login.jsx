import { useState } from "react";
import api from "../../api/axios";
import { setAuth } from "../../auth/auth";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      setAuth(res.data.user, res.data.token);

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }

    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
      }}
    >
      <Card sx={{ width: 380, borderRadius: 3, p: 2 }}>

        <CardContent>

          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome Back
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            Login to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Login"}
          </Button>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Don’t have an account?{" "}
            <Link
              component="button"
              onClick={() => navigate("/register")}
            >
              Create one
            </Link>
          </Typography>

        </CardContent>

      </Card>
    </Box>
  );
}
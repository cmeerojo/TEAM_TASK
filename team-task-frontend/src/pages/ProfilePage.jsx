import { useState } from "react";
import { getUser } from "../auth/auth";
import api from "../api/axios";

import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
} from "@mui/material";

export default function ProfilePage() {

  const currentUser = getUser();

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [file, setFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = async () => {

    try {

      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);

      if (file) {
        formData.append("avatar", file);
      }

      // handle password change if provided
      if (newPassword) {
        if (!currentPassword) {
          alert("Please enter your current password to change your password.");
          return;
        }
        if (newPassword !== confirmPassword) {
          alert("New password and confirmation do not match.");
          return;
        }
        formData.append("current_password", currentPassword);
        formData.append("new_password", newPassword);
        formData.append("new_password_confirmation", confirmPassword);
      }

      // UPDATE PROFILE
      const res = await api.patch(
        `/profile/${currentUser.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // STORE UPDATED USER
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Profile updated successfully!");

      // REFRESH PAGE
      window.location.reload();

    } catch (err) {

      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response?.data);

      alert("Update failed");

    }
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card sx={{ width: 400 }}>
        <CardContent>

          {/* AVATAR */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Avatar
              src={currentUser?.avatar_url}
              sx={{
                width: 100,
                height: 100,
              }}
            >
              {!currentUser?.avatar_url &&
                currentUser?.name?.charAt(0)}
            </Avatar>
          </Box>

          {/* TITLE */}
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              mb: 3,
            }}
          >
            My Profile
          </Typography>

          {/* NAME */}
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* EMAIL */}
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* FILE INPUT */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{
              marginBottom: "20px",
            }}
          />

          {/* PASSWORD CHANGE */}
          <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
            Change Password
          </Typography>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 8 characters"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* SAVE BUTTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleUpdate}
          >
            Save Changes
          </Button>

        </CardContent>
      </Card>
    </Box>
  );
}
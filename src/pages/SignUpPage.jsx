import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    Snackbar,
} from "@mui/material";

export default function Signup() {
    const navigate = useNavigate();
    const [reqError, setReqError] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const signup = () => {
        if (password !== confirmPassword) {
            setReqError("Passwords do not match");
            setOpenSnackbar(true);
            return;
        }

        if (username && password) {
            fetch("https://api-openvideos.nicolastech.xyz/v1/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    confirmPassword: confirmPassword,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.status === 200) {
                        navigate("/login");
                    } else {
                        console.error(
                            "Request failed with status: " +
                                data.status +
                                " " +
                                data.message
                        );
                        setReqError(data.message);
                        setOpenSnackbar(true);
                    }
                })
                .catch((error) => {
                    console.error("Request failed with error: " + error);
                    setReqError("An error occurred.");
                    setOpenSnackbar(true);
                });
        }
    };

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100vh - 64px)",
            }}
        >
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={reqError}
            />
            <div
                sx={{
                    boxShadow: 4,
                    p: 4,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    width: "100%",
                    maxWidth: "xs",
                }}
            >
                <Typography
                    variant="h4"
                    sx={{ textAlign: "center", mb: 4 }}
                >
                    Sign Up
                </Typography>
                <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    label="Confirm Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={signup}
                >
                    Sign Up
                </Button>
            </div>
        </Container>
    );
}

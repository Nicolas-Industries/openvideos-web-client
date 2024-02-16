import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Container, Typography, TextField, Snackbar } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function Signup({ onLogin }) {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(["token"]);
    const [reqError, setReqError] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (cookies.token) {
        navigate("/");
    }

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const signup = () => {
        if (isLoading === true) return;

        if (password !== confirmPassword) {
            setReqError("Passwords do not match");
            setOpenSnackbar(true);
            return;
        }

        if (username && password) {
            setIsLoading(true);
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
                    setIsLoading(false);
                    setCookie("token", data.token, {
                        path: "/",
                        maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
                    });
                    onLogin(); // Call onLogin when the user logs in
                    navigate("/");
                })
                .catch((error) => {
                    setIsLoading(false);
                    console.error("Request failed with error: " + error);
                    setReqError(error.message);
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
                style={{
                    boxShadow: 4,
                    p: 4,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    width: "100%",
                    maxWidth: "500px",
                }}
            >
                <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
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
                <div>
                    <HCaptcha
                        sitekey="10000000-ffff-ffff-ffff-000000000001"
                        onVerify={(token, ekey) =>
                            handleVerificationSuccess(token, ekey)
                        }
                    />
                </div>
                <LoadingButton
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    loading={isLoading}
                    onClick={signup}
                >
                    <span>Sign Up</span>
                </LoadingButton>
            </div>
        </Container>
    );
}

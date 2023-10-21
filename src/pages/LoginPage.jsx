import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Button,
    Snackbar,
} from "@mui/material";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(["token"]);
    const [isLoading, setIsLoading] = useState(false);
    const [reqError, setReqError] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const login = () => {
        if (username && password) {
            setIsLoading(true);
            fetch("https://api-openvideos.nicolastech.xyz/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.token) {
                        setCookie("token", data.token, {
                            path: "/",
                            maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
                        });
                        onLogin(); // Call onLogin when the user logs in
                        navigate("/");
                    } else {
                        console.error(
                            "Request failed with status: " +
                                data.status +
                                " " +
                                data.message
                        );
                        setReqError({ message: data.message });
                        setOpenSnackbar(true);
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.error("Request failed with error: " + error);
                    setReqError({ message: "An error occurred." });
                    setOpenSnackbar(true);
                    setIsLoading(false);
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
                message={reqError && reqError.message}
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
                <Typography variant="h4" sx={{ textAlign: "center", mb: 4 }}>
                    Login
                </Typography>
                <TextField
                    id="username"
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    id="password"
                    label="Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={login}
                    disabled={isLoading}
                >
                    Login
                </Button>
            </div>
        </Container>
    );
}

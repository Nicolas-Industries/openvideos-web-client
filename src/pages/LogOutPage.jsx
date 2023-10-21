import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

function LogOutPage({ onLogout }) {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(["token"]);
    const [error, setError] = useState(null);
    const token = cookies.token;

    const logout = async () => {
        try {
            const response = await fetch(
                "https://api-openvideos.nicolastech.xyz/v1/auth/logout",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: token }),
                }
            );

            if (!response.ok) {
                if (token) {
                    setError({ message: response.statusText });
                }
            }

            if (response.status === 200) {
                setCookie("token", "", {
                    path: "/",
                    maxAge: 0,
                });

                onLogout();
                navigate("/");
            }
        } catch (error) {
            console.error("Error logging out:", error);
            if (token) {
                setError({ message: error.message });
            }
        }
    };

    useEffect(() => {
        if (!token) {
            onLogout();
            navigate("/");
            setError(null);
        } else {
            logout();
        }
    }, []);

    return (
        <Box m={5} display="flex" flexDirection="column" alignItems="center">
            {error && (
                <Box
                    p={4}
                    mb={4}
                    bgcolor="error.main"
                    color="white"
                    fontSize="xl"
                    className="error-message"
                >
                    Error logging out: {error.message}
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => {
                            logout();
                        }}
                    >
                        Retry
                    </Button>
                </Box>
            )}

            <Typography variant="h4" gutterBottom>
                Logging out...
            </Typography>
            <Typography variant="body1">
                Please be patient as we log you out.
            </Typography>
            <CircularProgress color="primary" sx={{ mt: 2 }} />
        </Box>
    );
}

export default LogOutPage;

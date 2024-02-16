import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter as Router, Link } from "react-router-dom";

import { useCookies } from "react-cookie"; // Import the useCookies hook

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    IconButton,
} from "@mui/material";

import {
    Home as HomeIcon,
    VideoLibrary as VideoLibraryIcon,
    MenuRounded as MenuIcon,
    CloudUploadRounded,
} from "@mui/icons-material";

import platformLogo from "./assets/img/logo.svg";

import "./App.css";

import Home from "./pages/Home";
import Videos from "./pages/Videos";
import NotFound from "./pages/NotFound";
import ViewVideo from "./pages/VideoPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignUpPage";
import LogOutPage from "./pages/LogOutPage";
import StudioVideos from "./pages/studio/Videos";
import StudioVideoEdit from "./pages/studio/Video";
import StudioUpload from "./pages/studio/Upload";

function App() {
    const [open, setOpen] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(null);
    const [cookies] = useCookies(["token"]);

    async function checkSignInStatus() {
        if (!cookies.token) {
            setIsLoggedIn(false);
        } else {
            try {
                const response = await fetch(
                    "https://api-openvideos.nicolastech.xyz/v1/auth/tokenValidation",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token: cookies.token }),
                    }
                );

                if (response.status === 200) {
                    setIsLoggedIn(true);
                } else if (response.status === 401) {
                    setIsLoggedIn(false);
                } else {
                    console.error("Unexpected response status");
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error checking token validity:", error);
                setIsLoggedIn(false);
            }
        }
    }

    useEffect(() => {
        checkSignInStatus();
    }, [cookies.token]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleLogin = async () => {
        checkSignInStatus();
    };

    const handleLogout = async () => {
        checkSignInStatus();
    };

    return (
        <Router>
            <AppBar position="relative">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleDrawerOpen}
                    >
                        <MenuIcon />
                    </IconButton>
                    <img
                        src={platformLogo}
                        alt="OpenVideos"
                        height={35}
                        width={35}
                    />
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            textDecoration: "none",
                            color: "inherit",
                            marginLeft: 2,
                        }}
                    >
                        OpenVideos
                    </Typography>
                    {isLoggedIn ? (
                        <>
                            <IconButton
                                component={Link}
                                to="/studio/upload"
                                color="inherit"
                                sx={{
                                    marginLeft: "auto",
                                }}
                            >
                                <CloudUploadRounded />
                            </IconButton>
                            <Button
                                variant="contained"
                                color="success"
                                component={Link}
                                to="/logout"
                                sx={{
                                    marginLeft: 2,
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            component={Link}
                            to="/login"
                            sx={{
                                marginLeft: "auto",
                            }}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Container style={{ marginLeft: "auto", marginRight: "auto" }}>
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={handleDrawerClose}
                    anchor="left"
                >
                    <List>
                        <ListItemButton
                            onClick={handleDrawerClose}
                            component={Link}
                            to="/"
                        >
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                        <ListItemButton
                            onClick={handleDrawerClose}
                            component={Link}
                            to="/videos"
                        >
                            <ListItemIcon>
                                <VideoLibraryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Videos" />
                        </ListItemButton>
                        {isLoggedIn && (
                            <ListItemButton
                                onClick={handleDrawerClose}
                                component={Link}
                                to="/studio"
                            >
                                <ListItemIcon>
                                    <VideoLibraryIcon />
                                </ListItemIcon>
                                <ListItemText primary="Studio" />
                            </ListItemButton>
                        )}
                    </List>
                </Drawer>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/video/:videoId" element={<ViewVideo />} />
                    <Route
                        path="/login"
                        element={<Login onLogin={handleLogin} />}
                    />
                    <Route
                        path="/signup"
                        element={<Signup onLogin={handleLogin} />}
                    />
                    <Route
                        path="/logout"
                        element={<LogOutPage onLogout={handleLogout} />}
                    />
                    <Route path="/studio" element={<StudioVideos />} />
                    <Route path="/studio/videos" element={<StudioVideos />} />
                    <Route
                        path="/studio/:videoId"
                        element={<StudioVideoEdit />}
                    />
                    <Route path="/studio/upload" element={<StudioUpload />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;

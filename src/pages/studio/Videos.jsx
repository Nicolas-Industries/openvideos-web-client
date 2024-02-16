import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Grid,
    Button,
    CircularProgress,
} from "@mui/material";
import VideoCard from "../../components/VideoCard";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export default function StudioVideos() {
    const navigate = useNavigate();
    const [cookies] = useCookies(["token"]);
    const [videos, setVideos] = useState(null);
    const [error, setError] = useState(null);
    const token = cookies.token;

    if (!token) {
        navigate("/");
    }

    const fetchData = () => {
        fetch("https://api-openvideos.nicolastech.xyz/v1/user/getMyVideos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
            }),
        })
            .then((response) => response.json())
            .then((data) => setVideos(data.data))
            .catch((error) => {
                console.log(error);
                setError(error);
            });
    };

    useEffect(() => {
        fetchData(); // Initial fetch when the component mounts
    }, []);

    const handleRetry = () => {
        setError(null);
        fetchData(); // Retry the fetch when the button is clicked
    };

    return (
        <Container>
            <Typography variant="h4" sx={{ marginTop: 2, marginBottom: 2 }}>
                My Videos
            </Typography>
            {error && (
                <Container
                    sx={{
                        marginTop: 4,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{ marginTop: 2, marginBottom: 2 }}
                    >
                        Error: {error.message}
                    </Typography>
                    <Button variant="contained" onClick={handleRetry}>
                        Retry
                    </Button>
                </Container>
            )}
            {!videos && (
                <Container
                    sx={{
                        marginTop: 4,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <CircularProgress />
                    <Typography
                        variant="h4"
                        sx={{ marginTop: 2, marginBottom: 2 }}
                    >
                        Loading...
                    </Typography>
                </Container>
            )}
            {!videos ||
                (videos.length === 0 && (
                    <Container
                        sx={{
                            marginTop: 4,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{ marginTop: 2, marginBottom: 2 }}
                        >
                            There are no videos to show.
                        </Typography>
                    </Container>
                ))}
            {videos && videos.length > 0 && (
                <Grid container spacing={2}>
                    {videos.map((video) => (
                        <Grid item key={video.id} xs={12} sm={6} md={4} lg={3}>
                            <VideoCard video={video} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

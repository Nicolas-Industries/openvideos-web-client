import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    CircularProgress,
    Button,
} from "@mui/material";
import Recommendations from "../components/Recommendations";

function ViewVideo() {
    const navigate = useNavigate();
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("https://api-openvideos.nicolastech.xyz/v1/video/info/get", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: videoId,
            }),
        })
            .then((response) => response.json())
            .then((data) => setVideo(data))
            .catch((error) => setError(error));
    }, [videoId]);

    
    if (error) {
        return (
            <Container sx={{ marginTop: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <Typography variant="h4" sx={{ marginTop: 2, marginBottom: 2 }}>
                    Error: {error.message}
                </Typography>
                <Button variant="contained" component="a" onClick={() => navigate("/")}>
                    Back to Home
                </Button>
            </Container>
        );
    }

    if (!video) {
        return (
            <Container sx={{ marginTop: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
                <Typography variant="h4" sx={{ marginTop: 2, marginBottom: 2 }}>
                    Loading
                </Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Grid sx={{ marginTop: 4 }} container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardMedia
                            component="video"
                            height="400"
                            src={video.videoUrl}
                            controls
                            autoPlay
                        />
                        <CardContent>
                            <Typography
                                variant="h4"
                                sx={{ marginTop: 2, marginBottom: 2 }}
                            >
                                {video.title}
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                sx={{ marginBottom: 1 }}
                            >
                                {video.authorName} • {video.views} views
                            </Typography>
                            <Typography variant="body1">
                                {video.description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Recommendations />
                </Grid>
            </Grid>
        </Container>
    );
}

export default ViewVideo;

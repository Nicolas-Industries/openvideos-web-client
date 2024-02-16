import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Recommendations from "../components/Recommendations";
import VideoPlayer from "../components/VideoPlayer";

function ViewVideo() {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const firstTimeFetch = useRef(true);

    const fetchData = () => {
        if (loading) {
            return;
        }
        setLoading(true);
        setVideo(null);
        fetch(
            "https://api-openvideos.nicolastech.xyz/v1/video/info/get?id=" +
                videoId,
            {
                method: "GET",
            }
        )
            .then((response) => response.json())
            .then((data) => {
                setVideo(data);
                setError(null);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (firstTimeFetch.current) {
            firstTimeFetch.current = false;
            fetchData();
        }
    }, []);

    useEffect(() => {
        if (!firstTimeFetch.current) {
            fetchData();
        }
    }, [videoId]);

    return (
        <Container>
            <Grid sx={{ marginTop: 4 }} container spacing={4}>
                <Grid item xs={12} md={8}>
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
                            <LoadingButton
                                variant="contained"
                                component="a"
                                onClick={() => fetchData()}
                                loading={loading}
                            >
                                Retry
                            </LoadingButton>
                        </Container>
                    )}

                    {loading && !error && (
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
                                Loading
                            </Typography>
                        </Container>
                    )}
                    {video && (
                        <Card>
                            <VideoPlayer video={video} />
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
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    <Recommendations videoId={videoId} />
                </Grid>
            </Grid>
        </Container>
    );
}

export default ViewVideo;

import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    Typography,
    Grid,
    Button,
    CircularProgress,
} from "@mui/material";
import VideoCard from "../components/VideoCard";

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [firstTimeFetch, setFirstTimeFetch] = useState(true);
    const [fetching, setFetching] = useState(false);
    const targetRef = useRef(null);

    const fetchVideos = (pageNumber) => {
        if (fetching || page > maxPage) {
            return;
        }

        // Set the page variable first
        setPage(pageNumber);
        setFetching(true);

        // Fetch the videos
        fetch(
            `https://api-openvideos.nicolastech.xyz/v1/recommendations/get?page=${pageNumber}`
        )
            .then((response) => response.json())
            .then((data) => {
                if (data.maxPage) {
                    setMaxPage(data.maxPage);
                }
                setVideos((prevVideos) => [...prevVideos, ...data.data]);
                setFetching(false);
            })
            .catch((error) => {
                console.error(error);
                setError(error);
                setLoading(false);
                setFetching(false);
            });
    };

    const handleRetry = () => {
        setError(null);
        fetchVideos(page);
    };

    useEffect(() => {
        if (firstTimeFetch) {
            fetchVideos(page);
            setFirstTimeFetch(false);
        }
    }, [firstTimeFetch, page]);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight =
                "innerHeight" in window
                    ? window.innerHeight
                    : document.documentElement.offsetHeight;
            const body = document.body;
            const html = document.documentElement;
            const docHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            const windowBottom = windowHeight + window.pageYOffset;

            if (windowBottom >= docHeight - 100) {
                fetchVideos(page + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page]);

    return (
        <Container>
            <Typography variant="h4" sx={{ marginTop: 2, marginBottom: 2 }}>
                Featured Videos
            </Typography>
            <Grid container spacing={2}>
                {videos.map((video) => (
                    <Grid item key={video.id} xs={12} sm={6} md={4} lg={3}>
                        <VideoCard video={video} />
                    </Grid>
                ))}
            </Grid>
            {loading && (
                <Container
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <CircularProgress />
                </Container>
            )}
            {error && (
                <Container
                    sx={{
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
            <Container
                ref={targetRef}
                sx={{ position: "relative", height: "10px" }}
            />
        </Container>
    );
}

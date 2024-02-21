import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import VideoCard from "../components/VideoCard";

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [firstTimeFetch, setFirstTimeFetch] = useState(true);
    const targetRef = useRef(null);
    const fetchingRef = useRef(false);
    const pageRef = useRef(1);
    const maxPage = useRef(1);

    const fetchVideos = (pageNumber) => {
        if (loading) {
            return;
        }

        if (fetchingRef.current || pageNumber > maxPage.current) {
            console.log("Already fetching or reached max page");
            return;
        }

        // Set the page variable first
        pageRef.current = pageNumber;
        fetchingRef.current = true;

        setLoading(true);

        // Fetch the videos
        fetch(
            `https://api-openvideos.nicolastech.xyz/v1/recommendations/get?page=${pageNumber}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                mode: "cors",
            }
        )
            .then((response) => response.json())
            .then((data) => {
                setError(null);
                setLoading(false);
                if (data.maxPage) {
                    maxPage.current = data.maxPage;
                }
                setVideos((prevVideos) => [...prevVideos, ...data.data]);
                fetchingRef.current = false;
            })
            .catch((error) => {
                console.error(error);
                setError(error);
                setLoading(false);
                fetchingRef.current = false;
            });
    };

    const handleRetry = () => {
        fetchVideos(pageRef.current);
    };

    useEffect(() => {
        if (firstTimeFetch) {
            fetchVideos(pageRef.current);
            setFirstTimeFetch(false);
        }
    }, [firstTimeFetch]);

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
            const windowBottom = windowHeight + window.scrollY;

            if (windowBottom >= docHeight - 100) {
                fetchVideos(pageRef.current + 1);
            }
        };

        document.addEventListener("scroll", handleScroll);

        return () =>
            document.removeEventListener("scroll", handleScroll);
    }, []);

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
            {loading && !error && (
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
                    <LoadingButton
                        variant="contained"
                        onClick={handleRetry}
                        loading={loading}
                    >
                        Retry
                    </LoadingButton>
                </Container>
            )}
            <Container
                ref={targetRef}
                sx={{ position: "relative", height: "10px" }}
            />
        </Container>
    );
}

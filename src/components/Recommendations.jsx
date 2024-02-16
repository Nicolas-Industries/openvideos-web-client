import React, { useState, useEffect } from "react";
import {
    Container,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Skeleton,
    ButtonBase,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Link } from "react-router-dom";

function Recommendations({ videoId }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommendations = () => {
        setLoading(true);
        fetch("https://api-openvideos.nicolastech.xyz/v1/recommendations/get")
            .then((response) => response.json())
            .then((data) => {
                setRecommendations(data.data);
                setError(null);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setRecommendations([]);
                setError(error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    useEffect(() => {
        fetchRecommendations();
    }, [videoId]);

    const skeletonCards = [];
    for (let i = 0; i < 20; i++) {
        skeletonCards.push(
            <ButtonBase key={i}>
                <Card sx={{ marginBottom: 2, width: "256px" }}>
                    <Skeleton
                        variant="rounded"
                        height={144}
                        animation="wave"
                        sx={{ marginBottom: 2 }}
                    />
                    <CardContent>
                        <Skeleton variant="text" width={150} animation="wave" />
                    </CardContent>
                </Card>
            </ButtonBase>
        );
    }

    if (loading && !error) {
        return <>{skeletonCards}</>;
    }

    if (error) {
        return (
            <Container
                sx={{
                    marginTop: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 2 }}>
                    Error: {error.message}
                </Typography>
                <LoadingButton
                    variant="contained"
                    component="a"
                    onClick={() => fetchRecommendations()}
                    loading={loading}
                >
                    Retry
                </LoadingButton>
            </Container>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Typography
                variant="h6"
                sx={{ marginTop: 2, marginBottom: 2, textAlign: "center" }}
            >
                There are no videos to recommend.
            </Typography>
        );
    }

    return (
        <div>
            {recommendations.map((video) => (
                <ButtonBase
                    key={video.id}
                    to={`/video/${video.id}`}
                    onClick={() => window.scrollTo(0, 0)}
                    underline="none"
                    component={Link}
                    sx={{ marginBottom: 2, borderRadius: "4px" }}
                >
                    <Card sx={{ width: "256px" }}>
                        <CardMedia
                            component="img"
                            width="50"
                            height="144"
                            image={video.thumbnailUrl}
                        />
                        <CardContent>
                            <Typography variant="subtitle2">
                                {video.title}
                            </Typography>
                        </CardContent>
                    </Card>
                </ButtonBase>
            ))}
        </div>
    );
}

export default Recommendations;

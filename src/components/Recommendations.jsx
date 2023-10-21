import React, { useState, useEffect } from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);

    // Simulate fetching recommendations (you should replace this with actual API calls)
    useEffect(() => {
        // Fetch recommendations and set them to the "recommendations" state
        // Replace this with your actual API call to get recommended videos
        fetch("https://api-openvideos.nicolastech.xyz/v1/recommendations/get")
            .then((response) => response.json())
            .then((data) => setRecommendations(data.data));
    }, []);

    if (recommendations.length === 0) {
        return <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 2, textAlign: "center" }}>There are no videos to recommend.</Typography>;
    }

    return (
        <div>
            {recommendations.map((video) => (
                <Link key={video.id} to={`/video/${video.id}`} onClick={() => window.scrollTo(0, 0)} underline="none">
                    <Card sx={{ marginBottom: 2, width: "250px" }}>
                        <CardMedia
                            component="img"
                            width="50"
                            height="100"
                            image={video.thumbnailUrl}
                        />
                        <CardContent>
                            <Typography variant="subtitle2">
                                {video.title}
                            </Typography>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

export default Recommendations;

import React from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function VideoCard({ video }) {
    return (
        <Link component={RouterLink} to={`/video/${video.id}`} underline="none">
            <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                    component="img"
                    alt={video.title}
                    height="140"
                    image={video.thumbnailUrl}
                />
                <CardContent>
                    <Typography variant="h6" component="div">
                        {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {video.authorName} • {video.views} views
                    </Typography>
                </CardContent>
            </Card>
        </Link>
    );
}

export default VideoCard;

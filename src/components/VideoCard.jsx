import React from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Link,
    ButtonBase
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function VideoCard({ video }) {
    return (
        <ButtonBase sx={{ borderRadius: "4px" }} component={RouterLink} to={`/video/${video.id}`} underline="none">
            <Card sx={{ width: 256 }}>
                <CardMedia
                    component="img"
                    alt={video.title}
                    height="144"
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
        </ButtonBase>
    );
}

export default VideoCard;

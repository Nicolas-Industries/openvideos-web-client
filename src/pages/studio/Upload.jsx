import React, { useState } from "react";
import {
    Container,
    Typography,
    Button,
    CircularProgress,
    TextField,
    Grid,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { CloudUploadRounded } from "@mui/icons-material";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";

export default function StudioUpload() {
    const navigate = useNavigate();

    const [cookies] = useCookies(["token"]);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    const token = cookies.token;

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const VisuallyHiddenInput = styled("input")({
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        height: 1,
        overflow: "hidden",
        position: "absolute",
        bottom: 0,
        left: 0,
        whiteSpace: "nowrap",
        width: 1,
    });

    const handleFileChange = (event, type) => {
        const file = event.target.files[0];
        if (type === "video") {
            setVideoFile(file);
        } else if (type === "thumbnail") {
            setThumbnailFile(file);
        }
    };

    const uploadVideo = async () => {
        if (videoFile) {
            setError(null);
            setUploading(true);

            const formData = new FormData();
            formData.append("videoFile", videoFile);

            if (thumbnailFile) {
                formData.append("thumbnailFile", thumbnailFile);
            }

            formData.append("token", token);
            formData.append("title", title);
            formData.append("description", description);

            try {
                const response = await fetch(
                    "https://api-openvideos.nicolastech.xyz/v1/upload/video",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (response.status == 200) {
                    navigate("/studio/videos");
                } else {
                    const data = await response.json();
                    setError(data.message || "Video upload failed");
                }
            } catch (error) {
                setError("An error occurred while uploading the video");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Container>
            <Typography
                variant="h4"
                sx={{ marginTop: 2, marginBottom: 2, textAlign: "center" }}
            >
                Upload a video
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        label="Title"
                        fullWidth
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        minRows={3}
                        sx={{ marginTop: 2 }}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Grid>
                <Grid
                    item
                    xs={6}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    {videoFile && (
                        <video
                            src={URL.createObjectURL(videoFile)}
                            width="400px"
                            style={{ borderRadius: "0.5em" }}
                            controls
                        />
                    )}
                    <Button
                        component="label"
                        variant="contained"
                        color="secondary"
                        startIcon={<CloudUploadRounded />}
                    >
                        Select video
                        <VisuallyHiddenInput
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e, "video")}
                        />
                    </Button>
                    {thumbnailFile && (
                        <img
                            src={URL.createObjectURL(thumbnailFile)}
                            alt="Thumbnail"
                            height="200px"
                        />
                    )}
                    <Button
                        component="label"
                        variant="contained"
                        color="secondary"
                        startIcon={<CloudUploadRounded />}
                    >
                        Select thumbnail (optional)
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, "thumbnail")}
                        />
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={uploadVideo}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <CircularProgress size={24} />
                        ) : (
                            "Upload Video"
                        )}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    {error && (
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

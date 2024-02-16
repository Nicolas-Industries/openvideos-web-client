import React, { useState, useRef, useEffect } from "react";
import {
    Container,
    Typography,
    Button,
    TextField,
    Grid,
    LinearProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
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

    const [isDeterminate, setIsDeterminate] = useState(false);
    const [progress, setProgress] = useState(0);
    const uploadingVideoIdRef = useRef(null);

    const [uploadStatus, setUploadStatus] = useState("");

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

    const afterUpload = async () => {
        console.log("success omg this was so hard to make congrats to who is reading this omg omg");
        navigate("/studio");
    };

    const uploadThumbnail = async () => {
        if (thumbnailFile) {
            const thumbnailFormData = new FormData();

            thumbnailFormData.append("thumbnailFile", thumbnailFile);
            thumbnailFormData.append("token", token);
            thumbnailFormData.append("videoId", uploadingVideoIdRef.current);

            try {
                const response = await fetch(
                    "https://api-openvideos.nicolastech.xyz/v1/upload/thumbnail",
                    {
                        method: "POST",
                        body: thumbnailFormData,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to upload thumbnail");
                } else {
                    const data = await response.json();
                    if (data.success) {
                        console.log("Thumbnail uploaded successfully");
                    }
                }
            } catch (error) {
                setError(
                    "An error occurred while uploading the thumbnail, do not worry. Your video is (probably) still gonna upload."
                );
            }
        }
    };

    const finalizeUpload = async (chunkNumber, totalChunks) => {
        try {
            const response = await fetch(
                "https://api-openvideos.nicolastech.xyz/v1/upload/video",
                {
                    method: "POST",
                    body: JSON.stringify({
                        videoId: uploadingVideoIdRef.current,
                        chunkNumber: chunkNumber,
                        totalChunks: totalChunks,
                        finishUpload: true,
                        token: token,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to upload chunk");
            } else {
                setUploading(true);
                setProgress(0);
                setIsDeterminate(false);
                return;
            }
        } catch (error) {
            setError("An error occurred while uploading the video");
            setUploading(false);
            setProgress(0);
            setIsDeterminate(false);
            uploadingVideoIdRef.current = null;
            return;
        }
    };

    const uploadVideoChunks = async () => {
        const chunkSize = 1 * 1024 * 1024; // 1MB chunk size
        const totalChunks = Math.ceil(videoFile.size / chunkSize);
        let start = 0;

        for (let i = 0; i < totalChunks; i++) {
            const chunk = videoFile.slice(start, start + chunkSize);
            const formData = new FormData();
            formData.append("videoFile", chunk);
            formData.append("videoId", uploadingVideoIdRef.current);
            formData.append("chunkNumber", i);
            formData.append("totalChunks", totalChunks);
            formData.append("token", token);

            try {
                const response = await fetch(
                    "https://api-openvideos.nicolastech.xyz/v1/upload/video",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to upload chunk");
                } else {
                    setIsDeterminate(true);
                    setProgress((i / totalChunks) * 100);
                    const data = await response.json();
                    if (data.newstatus) {
                        setProgress(100);
                        if (data.newstatus === "startProccessing") {
                            await finalizeUpload(i, totalChunks);
                        }
                    }
                }
            } catch (error) {
                setError("An error occurred while uploading the video");
                setUploading(false);
                setProgress(0);
                setIsDeterminate(false);
                uploadingVideoIdRef.current = null;
                return;
            }

            start += chunkSize;
        }
    };

    const firstUploadAction = async () => {
        setIsDeterminate(false);
        setUploading(true);

        const lastChunkFormData = new FormData();
        lastChunkFormData.append("token", token);
        lastChunkFormData.append("title", title);
        lastChunkFormData.append("description", description);

        try {
            const response = await fetch(
                "https://api-openvideos.nicolastech.xyz/v1/upload/video",
                {
                    method: "POST",
                    body: lastChunkFormData,
                }
            );

            if (response.status == 200) {
                const data = await response.json();

                if (data.videoId) {
                    uploadingVideoIdRef.current = data.videoId;
                    setIsDeterminate(true);
                    setProgress(0);
                    setUploading(true);
                    uploadThumbnail();
                    await uploadVideoChunks();
                } else {
                    setError(data.message || "Video upload failed");
                    setUploading(false);
                    setProgress(0);
                    setIsDeterminate(false);
                    return;
                }
            } else {
                const data = await response.json();
                setError(data.message || "Video upload failed");
                setUploading(false);
                setProgress(0);
                setIsDeterminate(false);
                uploadingVideoIdRef.current = null;
                return;
            }
        } catch (error) {
            setError("An error occurred while uploading the video");
            setUploading(false);
            setProgress(0);
            setIsDeterminate(false);
            uploadingVideoIdRef.current = null;
            return;
        }
    };

    const uploadVideo = async () => {
        if (videoFile) {
            setError(null);
            setUploading(true);

            await firstUploadAction();
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            if (uploading) {
                const response = await fetch(
                    "https://api-openvideos.nicolastech.xyz/v1/upload/checkVideo",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            id: uploadingVideoIdRef.current,
                            token: token,
                        }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    // Handle error
                } else {
                    setIsDeterminate(false);
                    setProgress(0);
                    const data = await response.json();
                    if (data.uploadStatus) {
                        setUploadStatus(data.uploadStatus);

                        if (data.uploadStatus === "finished") {
                            clearInterval(interval);
                            afterUpload();
                        }
                    }
                }
            }
        }, 5000);

        // Clear interval when component unmounts or when uploading changes
        return () => clearInterval(interval);
    }, [uploading]);

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
                            width="256px"
                            height="144px"
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
                    {uploading && (
                        <>
                            <LinearProgress
                                variant={
                                    isDeterminate
                                        ? "determinate"
                                        : "indeterminate"
                                }
                                value={progress}
                                sx={{ width: "100%" }}
                            />
                            <Typography
                                variant="body2"
                                sx={{ textAlign: "center" }}
                            >
                                {uploadStatus == "prepforupload" && (
                                    <span>Preparing for upload...</span>
                                )}
                                {uploadStatus == "uploading" && (
                                    <span>Uploading...</span>
                                )}
                                {uploadStatus == "startproccessing" && (
                                    <span>Preparing for processing...</span>
                                )}
                                {uploadStatus == "processing" && (
                                    <span>Processing...</span>
                                )}
                                {uploadStatus == "finished" && (
                                    <span>Finished</span>
                                )}
                            </Typography>
                        </>
                    )}
                </Grid>
                <Grid item xs={6}>
                    <LoadingButton
                        variant="contained"
                        color="primary"
                        onClick={uploadVideo}
                        loading={uploading}
                    >
                        Upload Video
                    </LoadingButton>
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

import React, { useEffect, useRef, useState } from "react";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { MenuItem, Menu, CircularProgress } from "@mui/material";
import { Settings } from "@mui/icons-material";

function VideoPlayer({ video }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [wasPlaying, setWasPlaying] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [fullscreen, setFullscreen] = useState(false); // State to track fullscreen mode
    const [mouseOverPlayer, setMouseOverPlayer] = useState(false);
    const [qualityLevel, setQualityLevel] = useState("auto");
    const videoRef = useRef(null);
    const sliderRef = useRef(null);
    const playerRef = useRef(null);
    const animationFrameRef = useRef(null);
    let hideControlsTimeout;
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const videoElement = videoRef.current;

        const b = setInterval(() => {
            if (videoElement.readyState < 3) {
                setVideoLoaded(true);
            } else {
                setVideoLoaded(false);
            }
        }, 500);
        return () => {
            clearInterval(b);
        };
    }, []);

    const animate = () => {
        const videoElement = videoRef.current;
        const newTime =
            currentTime + (videoElement.currentTime - currentTime) * 0.5;
        setCurrentTime(newTime);
        animationFrameRef.current = requestAnimationFrame(animate);
    };

    const togglePlay = () => {
        const videoElement = videoRef.current;
        setDragging(false);
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;

        const updateTime = () => {
            setCurrentTime(videoElement.currentTime);
        };

        const updateDuration = () => {
            setDuration(videoElement.duration);
        };

        videoElement.addEventListener("timeupdate", updateTime);
        videoElement.addEventListener("loadedmetadata", updateDuration);

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            videoElement.removeEventListener("timeupdate", updateTime);
            videoElement.removeEventListener("loadedmetadata", updateDuration);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [animate]);

    useEffect(() => {
        const player = playerRef.current;

        const hideControls = () => {
            if (!dragging) {
                hideControlsTimeout = setTimeout(() => {
                    setShowControls(false);
                }, 3000);
            }
        };

        hideControls();

        const handleMouseMove = () => {
            if (!showControls) {
                setShowControls(true);
                clearTimeout(hideControlsTimeout);
                hideControls();
            }
        };

        player.addEventListener("mousemove", handleMouseMove);

        return () => {
            player.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(hideControlsTimeout);
        };
    }, [showControls, dragging]);

    const handleSliderClick = (e) => {
        if (!dragging) {
            const sliderRect = sliderRef.current.getBoundingClientRect();
            const offsetX = e.clientX - sliderRect.left;
            const percentage = offsetX / sliderRect.width;
            const newTime = percentage * duration;
            setCurrentTime(newTime);
            videoRef.current.currentTime = newTime;
        }
    };

    const handleThumbMouseDown = (e) => {
        e.preventDefault();
        setDragging(true);
        setWasPlaying(!videoRef.current.paused);
        if (wasPlaying) {
            videoRef.current.pause();
        }
    };

    const handleMouseMove = (e) => {
        if (dragging) {
            const sliderRect = sliderRef.current.getBoundingClientRect();
            const offsetX = e.clientX - sliderRect.left;
            let percentage = offsetX / sliderRect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            const newTime = percentage * duration;
            setCurrentTime(newTime);
            videoRef.current.currentTime = newTime;
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
        if (wasPlaying) {
            videoRef.current.play();
        }
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging]);

    useEffect(() => {
        if (!showControls && !dragging && mouseOverPlayer) {
            document.documentElement.style.cursor = "none";
        } else {
            document.documentElement.style.cursor = "auto";
        }
    }, [showControls]);

    useEffect(() => {
        const player = playerRef.current;
        const videoElement = videoRef.current;

        const mouseOverPlayer = () => {
            if (!dragging) {
                setMouseOverPlayer(true);
            }
        };

        const mouseNotOverPlayer = () => {
            setMouseOverPlayer(false);
        };

        const keyPressed = (e) => {
            if (e.code === "Space" && e.target == document.body) {
                e.preventDefault();
                togglePlay();
            }
        };

        videoElement.addEventListener("click", togglePlay);
        player.addEventListener("mouseover", mouseOverPlayer);
        player.addEventListener("mouseleave", mouseNotOverPlayer);

        document.addEventListener("keyup", keyPressed);

        return () => {
            videoElement.removeEventListener("click", togglePlay);
            document.removeEventListener("keyup", keyPressed);
            player.removeEventListener("mouseover", mouseOverPlayer);
            player.removeEventListener("mouseleave", mouseNotOverPlayer);
        };
    }, []);

    const handleQualityMenuClose = () => {
        setShowQualityMenu(false);
    };

    const handleQualityMenuToggle = () => {
        setShowQualityMenu((prev) => !prev);
    }

    const handleQualitySelect = (quality) => {
        const currentTime = videoRef.current.currentTime;

        setQualityLevel(quality);

        const newVideoUrl = `${video.videoUrl}&resolution=${quality}`;

        videoRef.current.src = newVideoUrl;

        videoRef.current.currentTime = currentTime;
        handleQualityMenuClose();
    };

    const toggleFullscreen = () => {
        const player = playerRef.current;
        if (!document.fullscreenElement) {
            player.requestFullscreen().catch((err) => {
                console.log(
                    `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
                );
            });
        } else {
            document.exitFullscreen();
        }
        setFullscreen(!fullscreen);
    };

    return (
        <div className="video-player" ref={playerRef}>
            <video
                ref={videoRef}
                height={fullscreen ? "100%" : "400"}
                width={"100%"}
                src={video.videoUrl}
                autoPlay
            />
            {videoLoaded ? (
                <div style={{ color: "white", width: "100%", height: "100%", top: 0, left: 0, position: "absolute", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress
                        color="inherit"
                        size={60}
                    />
                </div>
            ) : null}
            <div
                className={`video-player-controls ${
                    showControls || dragging || videoRef.current.paused
                        ? "visible"
                        : "hidden"
                }`}
            >
                <div
                    className="custom-slider"
                    ref={sliderRef}
                    onClick={handleSliderClick}
                    onMouseDown={handleThumbMouseDown}
                >
                    <div className="slider-track">
                        <div
                            className="slider-fill"
                            style={{
                                width: `${(currentTime / duration) * 100}%`,
                            }}
                        >
                            <div className="slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <button onClick={() => togglePlay()}>
                    {videoRef.current?.paused ? (
                        <PlayArrowIcon />
                    ) : (
                        <PauseIcon />
                    )}
                </button>
                <button style={{ float: "right" }} onClick={toggleFullscreen}>
                    {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </button>
                <button
                    style={{ float: "right" }}
                    onClick={handleQualityMenuToggle}
                >
                    <Settings />
                </button>
                {showQualityMenu && (
                    <div className="custom-menu">
                        <ul>
                            <li onClick={() => handleQualitySelect("1080p")}>
                                1080p
                            </li>
                            <li onClick={() => handleQualitySelect("720p")}>
                                720p
                            </li>
                            <li onClick={() => handleQualitySelect("480p")}>
                                480p
                            </li>
                            <li onClick={() => handleQualitySelect("360p")}>
                                360p
                            </li>
                            <li onClick={() => handleQualitySelect("240p")}>
                                240p
                            </li>
                            <li onClick={() => handleQualitySelect("144p")}>
                                144p
                            </li>
                            <li onClick={() => handleQualitySelect("auto")}>
                                Auto
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;

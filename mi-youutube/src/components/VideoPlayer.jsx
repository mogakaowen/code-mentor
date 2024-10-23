import React from "react";

const VideoPlayer = ({ video }) => {
  if (!video) return null;

  const videoId = video.id.videoId;

  return (
    <div className="flex flex-col items-start">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <h2 className="text-xl font-bold mt-2">{video.snippet.title}</h2>
      <p className="text-gray-600">{video.snippet.description}</p>
    </div>
  );
};

export default VideoPlayer;

import React from "react";

const VideoPlayer = ({ video }) => {
  if (!video) return null;

  const videoId = video.id.videoId;

  return (
    <div className="flex flex-col items-start gap-2">
      <iframe
        className="w-full rounded-lg"
        height="350"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>

      <div className="rounded-lg p-2">
        <p className="text-xl font-bold mt-2">{video.snippet.title}</p>
        <p>{video.snippet.description}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;

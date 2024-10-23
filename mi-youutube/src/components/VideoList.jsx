import React from "react";

const VideoList = ({ videos, onSelectVideo }) => {
  return (
    <div className="flex flex-col space-y-4">
      {videos.map((video, index) => (
        <div
          key={video.id.videoId || index}
          className="flex cursor-pointer"
          onClick={() => onSelectVideo(video)}
        >
          <img
            src={video.snippet.thumbnails.default.url}
            alt={video.snippet.title}
            className="w-24 h-16"
          />
          <div className="ml-2">
            <h3 className="text-sm font-bold">{video.snippet.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;

import { Divider } from "antd";
import React from "react";

const VideoList = ({ videos, onSelectVideo }) => {
  return (
    <div className="flex flex-col space-y-2">
      {videos.map((video, index) => (
        <>
          <div
            key={video.id.videoId || index}
            className="flex items-start justify-start  cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            onClick={() => onSelectVideo(video)}
          >
            <div className="w-full">
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                className="w-40 h-24 object-cover" // Set width and height, and cover
              />
            </div>
            <div className="w-full p-2">
              <p className="text-base font-semibold line-clamp-2">
                {video.snippet.title}
              </p>

              <p className="text-xs">
                {new Date(video.snippet.publishedAt).toLocaleDateString()}{" "}
              </p>
            </div>
          </div>
          <Divider style={{ borderWidth: 2 }} />
        </>
      ))}
    </div>
  );
};

export default VideoList;

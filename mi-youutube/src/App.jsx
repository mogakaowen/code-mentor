import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import VideoPlayer from "./components/VideoPlayer";

const App = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // keys are exposed in Vite's import.meta.env and must start with VITE_

  const searchVideos = useCallback(
    async (query) => {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search`,
          {
            params: {
              part: "snippet",
              q: query,
              maxResults: 5,
              key: API_KEY,
            },
          }
        );
        setVideos(response.data.items);
        if (response.data.items.length > 0) {
          setSelectedVideo(response.data.items[0]); // Set first video as featured
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    },
    [API_KEY]
  );

  useEffect(() => {
    searchVideos("JavaScript");
  }, [searchVideos]);

  return (
    <div className="flex">
      <div className="w-2/3 p-4">
        <SearchBar onSearch={searchVideos} />
        <VideoPlayer video={selectedVideo} />
      </div>
      <div className="w-1/3 p-4">
        <VideoList videos={videos} onSelectVideo={setSelectedVideo} />
      </div>
    </div>
  );
};

export default App;

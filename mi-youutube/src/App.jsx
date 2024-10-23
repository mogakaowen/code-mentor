import { useEffect, useState, useCallback, useContext } from "react";
import { ConfigProvider, Form, Input, theme } from "antd";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import VideoPlayer from "./components/VideoPlayer";
import { ThemeContext } from "../store/theme-context";

const App = () => {
  const { theme: currentTheme } = useContext(ThemeContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // keys are exposed in Vite's import.meta.env and must start with VITE_

  const searchVideos = useCallback(
    async (query) => {
      try {
        setIsLoading(true);
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
        setIsError(true);
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [API_KEY]
  );

  useEffect(() => {
    searchVideos("JavaScript");
  }, [searchVideos]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#C53030",
        },
        algorithm:
          currentTheme === "light"
            ? theme.defaultAlgorithm
            : theme.darkAlgorithm,
      }}
    >
      <div
        className={`${
          currentTheme === "light"
            ? "bg-stone-100 text-black"
            : "bg-stone-900 text-white"
        }
        min-h-screen p-2`}
      >
        <div className="w-full">
          <SearchBar onSearch={searchVideos} />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center mt-20">
            <p className="text-base">Loading...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center mt-20">
            <p className="text-base">
              Error fetching videos. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="flex flex-col md:flex-row gap-2">
            <div className="md:w-2/3 p-4">
              <VideoPlayer video={selectedVideo} />
            </div>
            <div className="md:w-1/3 p-4">
              <VideoList videos={videos} onSelectVideo={setSelectedVideo} />
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default App;

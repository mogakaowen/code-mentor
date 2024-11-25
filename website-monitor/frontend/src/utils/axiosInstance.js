import axios from "axios";
import {
  getAccessToken,
  logoutUser,
  setAccessToken,
} from "./localStorageService";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", // Use env variable for flexibility
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    } catch (error) {
      console.error("Error retrieving access token:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    // console.log("Error response originalRequest:", originalRequest);
    // console.log("originalRequest._retry:", originalRequest?._retry);

    if (
      error.response?.status === 401 &&
      originalRequest.url === "/users/refresh"
    ) {
      window.location.href = "/auth/signin";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        console.log("Refreshing token...");
        const response = await axiosInstance.post("/users/refresh"); // Cookie-based refresh token request
        console.log("Response:", response);
        const newAccessToken = response?.data?.accessToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosInstance(originalRequest);
        } else {
          // Clear local storage and redirect to login if refresh token is invalid
          await logoutUser();
          window.location.href = "/auth/signin";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Handle refresh token failure
        await logoutUser();
        window.location.href = "/auth/signin";
        console.error("Failed to refresh token:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

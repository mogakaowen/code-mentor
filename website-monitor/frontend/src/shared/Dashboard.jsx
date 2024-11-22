import React, { useEffect, useState } from "react";
import { Card } from "antd";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { getSessionData } from "../utils/localStorageService";
import LottieAnimation from "./LottiePlayer";

// Fetch statistics with useQuery
const fetchStatistics = async () => {
  const sessionData = getSessionData();
  if (!sessionData?.email) {
    throw new Error("User not authenticated.");
  }

  const response = await axiosInstance.get(
    `/reports/statistics?email=${sessionData.email}`
  );
  return response.data;
};

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: statistics,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["statistics"],
    queryFn: fetchStatistics,
    staleTime: 1000 * 60 * 1,
  });

  // Prepare the data for the chart
  const chartData =
    statistics?.map((item) => ({
      websiteUrl: new URL(item.websiteUrl).hostname, // Extract domain name
      availability: item.availability || 0,
      uptime: item.uptime || 0,
      downtime: item.downtime || 0,
    })) || [];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <LottieAnimation
          animation="/web-takeoff.lottie"
          width={collapsed ? "100px" : "200px"}
          height={collapsed ? "100px" : "200px"}
        />
      </div>
    );
  }

  // Show error message
  if (isError) {
    return (
      <div className="p-4">
        <Card title="Website Availability and Uptime" className="w-full">
          <p>Error: {error.message}</p>
        </Card>
      </div>
    );
  }

  // Show the data chart if available
  if (statistics.length === 0) {
    return (
      <div className="p-4">
        <Card
          title="Website Availability and Uptime"
          className="w-full text-center"
        >
          <p>No statistics available.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title="Website Availability and Uptime" className="w-full">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="websiteUrl"
              tick={{ angle: -15, textAnchor: "end" }}
              interval={0}
              tickLine={false}
              dy={-10}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="availability"
              fill="#82ca9d"
              name="Availability (%)"
            />
            <Bar dataKey="uptime" fill="#8884d8" name="Uptime (hrs)" />
            <Bar dataKey="downtime" fill="#ff7300" name="Downtime (hrs)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { Card, Col, Row } from "antd";
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
import axiosInstance from "../utils/axiosInstance";
import { getSessionData } from "../utils/localStorageService";

const Dashboard = () => {
  const [statistics, setStatistics] = useState([]);

  useEffect(() => {
    const sessionData = getSessionData();

    const fetchStatistics = async () => {
      try {
        const response = await axiosInstance.get(
          `/reports/statistics?email=${sessionData.email}`
        );
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  // Prepare the data for the chart
  const chartData = statistics.map((item) => ({
    websiteUrl: new URL(item.websiteUrl).hostname, // Extract domain name
    availability: item.availability,
    uptime: item.uptime,
    downtime: item.downtime,
  }));

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

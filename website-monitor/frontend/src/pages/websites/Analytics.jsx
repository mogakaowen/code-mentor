import React, { useEffect, useState } from "react";
import { Card } from "antd";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { getSessionData } from "../../utils/localStorageService";
import LottieAnimation from "../../shared/LottiePlayer";

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

const Analytics = () => {
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

  // Format Uptime and Downtime percentages
  const formatPercentage = (uptime, downtime) => {
    const total = uptime + downtime;
    return total > 0 ? (uptime / total) * 100 : 0;
  };

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

  if (isError) {
    return (
      <div className="p-4">
        <Card title="Website Analytics" className="w-full">
          <p>Error: {error.message}</p>
        </Card>
      </div>
    );
  }

  if (statistics.length === 0) {
    return (
      <div className="p-4">
        <Card title="Website Analytics" className="w-full text-center">
          <p>No statistics available.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card title="Website Uptime and Downtime Analytics" className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {statistics.map((item) => {
            const uptimePercentage = formatPercentage(
              item.uptime,
              item.downtime
            );
            const downtimePercentage = 100 - uptimePercentage;

            return (
              <Card
                key={item.websiteUrl}
                title={new URL(item.websiteUrl).hostname}
                bordered={false}
                className="text-center"
              >
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Uptime", value: uptimePercentage },
                        { name: "Downtime", value: downtimePercentage },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell name="Uptime" fill="#52c41a" />
                      <Cell name="Downtime" fill="#ff7300" />
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;

import React from "react";
import { Table, Badge, Button, message } from "antd";
import axiosInstance from "../utils/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchWebsites = async () => {
  const { data } = await axiosInstance.get(
    `${import.meta.env.VITE_API_BASE_URL}/websites/all`
  );
  return data.websites;
};

const deleteWebsite = async (id) => {
  await axiosInstance.delete(
    `${import.meta.env.VITE_API_BASE_URL}/websites/delete/${id}`
  );
};

const Dashboard = () => {
  const queryClient = useQueryClient();

  // Fetch websites
  const { data: websites, isLoading } = useQuery({
    queryKey: ["websites"],
    queryFn: fetchWebsites,
  });

  // Delete website mutation
  const mutation = useMutation({
    mutationFn: deleteWebsite,
    onSuccess: () => {
      message.success("Website deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["websites"] });
    },
    onError: () => {
      message.error("Failed to delete the website");
    },
  });

  // Table columns
  const columns = [
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          color={status === "up" ? "green" : status === "down" ? "red" : "gray"}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: "Interval (seconds)",
      dataIndex: "interval",
      key: "interval",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          danger
          onClick={() => mutation.mutate(record._id)}
          disabled={mutation.isLoading}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Monitored Websites</h2>
      <Table
        columns={columns}
        dataSource={websites}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default Dashboard;

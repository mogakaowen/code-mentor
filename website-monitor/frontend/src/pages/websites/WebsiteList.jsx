import React from "react";
import {
  Table,
  Badge,
  Button,
  message,
  Alert,
  Space,
  Tooltip,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  MinusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../utils/localStorageService";

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

const WebsiteList = () => {
  const navigate = useNavigate();

  // Fetch websites
  const {
    data: websites,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["websites"],
    queryFn: fetchWebsites,
    staleTime: 1000 * 60 * 5, // 5 minutes and is the time after which the data is considered stale
    gcTime: 1000 * 60 * 10, // 10 minutes and is the time after which the data is garbage collected
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
      className: "hidden sm:table-cell",
      render: (status) => (
        <Badge
          color={status === "up" ? "green" : status === "down" ? "red" : "gray"}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: "Interval (minutes)",
      dataIndex: "interval",
      key: "interval",
      className: "hidden sm:table-cell",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/websites/edit/${record._id}`)}
              disabled={mutation.isLoading}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => mutation.mutate(record._id)}
              disabled={mutation.isLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expandable settings for the table
  const expandable = {
    expandedRowRender: (record) => (
      <div className="w-[60vw] md:w-full">
        <Descriptions
          bordered
          column={1}
          size="small"
          labelStyle={{ fontWeight: 600 }}
        >
          <Descriptions.Item label="Website URL">
            {record.url}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Descriptions.Item>
          <Descriptions.Item label="Interval (seconds)">
            {record.interval}
          </Descriptions.Item>
          <Descriptions.Item label="Creation Date">
            {record.createdAt}
          </Descriptions.Item>
        </Descriptions>
      </div>
    ),
    expandIcon: ({ expanded, onExpand, record }) =>
      expanded ? (
        <MinusOutlined
          style={{ color: "#A32A29" }}
          onClick={(e) => onExpand(record, e)}
        />
      ) : (
        <PlusOutlined
          style={{ color: "#A32A29" }}
          onClick={(e) => onExpand(record, e)}
        />
      ),
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center bg-gray-100">
        <Alert
          message="Something went wrong!"
          description={`${error.message}`}
          type="error"
          showIcon
          action={
            <Button size="small" type="link" onClick={() => refetch()}>
              Retry
            </Button>
          }
          className="mb-4"
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 bg-white shadow-md rounded-lg w-full mb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm md:text-xl font-semibold text-gray-800 mb-4">
            Add a New Website
          </p>
          <Button
            type="primary"
            className="mb-4 w-full sm:w-auto shadow-none"
            onClick={() => navigate("/websites-add")}
            icon={<PlusOutlined />}
          >
            Add Website
          </Button>
        </div>
        <p className="text-gray-600 mb-6">
          To monitor a new website, click the add button below and fill in the
          required details in the form.
        </p>
      </div>

      <div className="p-6 bg-white shadow-md rounded-lg w-full">
        <h2 className="text-2xl font-semibold mb-4">Monitored Websites</h2>
        <Table
          columns={columns}
          dataSource={websites}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          expandable={expandable}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
};

export default WebsiteList;

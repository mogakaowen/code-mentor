import React from "react";
import {
  Table,
  Badge,
  Button,
  message,
  Space,
  Tooltip,
  Descriptions,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  MinusOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../utils/localStorageService";
import ErrorPage from "../../shared/ErrorPage";

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
      // Implementing search
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            autoFocus
            placeholder={`Search URL`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              className="shadow-none"
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.url.toLowerCase().includes(value.toLowerCase()),
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
            />
          </Tooltip>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined className="text-yellow-500" />}
              onClick={() => navigate(`/websites/view/${record._id}`)}
              style={{
                borderColor: "yellow",
                "&:hover": {
                  borderColor: "lightyellow",
                },
              }}
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
          <Descriptions.Item label="Interval (minutes)">
            {record.interval}
          </Descriptions.Item>
          <Descriptions.Item label="Last Checked">
            {record.lastChecked
              ? new Date(record.lastChecked).toLocaleString()
              : "In progress"}
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
    const errorDescription = error?.response?.data?.error || error?.message;

    return (
      <ErrorPage description={errorDescription} onRetry={() => refetch()} />
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
            className="mb-4 w-auto  shadow-none"
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
          scroll={{ x: "max-content" }}
          bordered
        />
      </div>
    </>
  );
};

export default WebsiteList;

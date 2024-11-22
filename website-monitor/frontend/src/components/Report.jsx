import { Card, Row, Col, Progress, Table } from "antd";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const convertSecondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600); // Get the full hours
  const minutes = Math.floor((seconds % 3600) / 60); // Get the remaining minutes
  const remainingSeconds = Math.floor(seconds % 60); // Get the remaining seconds

  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

const convertMillisecondsToTime = (ms) => {
  const hours = Math.floor(ms / 3600000); // Get the full hours
  const minutes = Math.floor((ms % 3600000) / 60000); // Get the remaining minutes
  const seconds = Math.floor(((ms % 360000) % 60000) / 1000); // Get the remaining seconds

  return `${hours}h ${minutes}m ${seconds}s`;
};

const Report = ({ report, logs }) => {
  const {
    status,
    availability,
    outages,
    uptime,
    downtime,
    avgResponseTime,
    history,
  } = report;

  const convertResponseTime = (responseTime) => {
    if (responseTime >= 3600000) {
      // Convert to hours if >= 1 hour
      return (responseTime / 3600000).toFixed(2);
    } else if (responseTime >= 60000) {
      // Convert to minutes if >= 1 minute
      return (responseTime / 60000).toFixed(2);
    } else {
      // Convert to seconds
      return (responseTime / 1000).toFixed(2);
    }
  };

  const formattedHistory = history.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleString(),
    responseTime: convertResponseTime(item.responseTime),
  }));

  const logColumns = [
    {
      title: "Checked At",
      dataIndex: "checkedAt",
      key: "checkedAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Status Code",
      dataIndex: "statusCode",
      key: "status",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Overview */}

      <Card title="Report Overview" bordered={false} style={{ width: "100%" }}>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Availability:</strong> {availability}%
        </p>
        <Progress percent={availability} status="active" />
        <p>
          <strong>Outages:</strong> {outages}
        </p>
        <p>
          <strong>Uptime:</strong> {convertSecondsToTime(uptime)}
        </p>
        <Progress percent={(uptime / (uptime + downtime)) * 100} />
        <p>
          <strong>Downtime:</strong> {convertSecondsToTime(downtime)}
        </p>
        <p>
          <strong>Average Response Time:</strong>{" "}
          {convertMillisecondsToTime(avgResponseTime)}
        </p>
      </Card>

      <Card
        title="Response Time History"
        bordered={false}
        style={{ width: "100%" }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedHistory}>
            {/* Enhanced line styling */}
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#0000FF"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {/* Grid for better visibility */}
            <CartesianGrid strokeDasharray="3 3" />

            {/* X-axis with formatted timestamps */}
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              angle={-45}
              textAnchor="end"
              interval={0} // Display every tick
              height={80} // Add space to avoid label clipping
              tick={{ fontSize: 10 }}
            />

            {/* Y-axis with label */}
            <YAxis
              tickFormatter={(value) => {
                if (avgResponseTime >= 3600000) {
                  return `${value}h`;
                } else if (avgResponseTime >= 60000) {
                  return `${value}m`;
                } else {
                  return `${value}s`;
                }
              }}
              label={{
                value:
                  avgResponseTime >= 3600000
                    ? "Response Time (hrs)"
                    : avgResponseTime >= 60000
                    ? "Response Time (mins)"
                    : "Response Time (s)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#555" },
              }}
            />
            {/* Tooltip for data inspection */}
            <Tooltip
              formatter={(value) => {
                if (avgResponseTime >= 3600000) {
                  return `${value}h`;
                } else if (avgResponseTime >= 60000) {
                  return `${value}m`;
                } else {
                  return `${value}s`;
                }
              }}
              labelFormatter={(label) =>
                `Checked At: ${new Date(label).toLocaleString()}`
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Logs" bordered={false} style={{ width: "100%" }}>
        <Table
          dataSource={logs}
          columns={logColumns}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Report;

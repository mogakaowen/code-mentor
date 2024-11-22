import { Card, Row, Col, Progress, Table } from "antd";
import {
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

  history.forEach((item) => {
    item.timestamp = new Date(item.timestamp).toLocaleString();
    item.responseTime = item.responseTime / 1000;
  });

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

      <Card title="Report Overview" bordered={false}>
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

      <Card title="Logs" bordered={false}>
        <Table
          dataSource={logs}
          columns={logColumns}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      {/* History Visualization */}

      <Card title="Response Time History" bordered={false}>
        <LineChart width={600} height={300} data={history}>
          <Line type="monotone" dataKey="responseTime" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </Card>
    </div>
  );
};

export default Report;

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import { Alert, Skeleton, Space, Tag } from "antd";
import Report from "../../components/Report";
import { getSessionData } from "../../utils/localStorageService";
import ErrorPage from "../../shared/ErrorPage";

const getWebsiteData = async (id) => {
  try {
    const response = await axiosInstance.get(`/websites?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching website data:", error);
    throw error;
  }
};

const getWebsiteReport = async (id, email) => {
  try {
    const response = await axiosInstance.get(
      `/reports/website/${id}/?email=${email}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching website report:", error);
    throw error;
  }
};

const ViewWebsite = () => {
  const { id } = useParams();
  const sessionData = getSessionData();

  // Fetching website data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["websites", id],
    queryFn: () => getWebsiteData(id),
  });

  // Fetching website report data
  const {
    data: reportData,
    isLoading: isFetching,
    isError: hasError,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["websiteReport", id, sessionData?.email],
    queryFn: () => getWebsiteReport(id, sessionData?.email),
  });

  // Destructuring report data
  const { report, logs } = reportData || {};

  // Render loading skeleton or spinner
  if (isLoading || isFetching) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </Space>
    );
  }

  // Render error page if either of the requests failed
  if (isError || hasError) {
    const webError = error?.response?.data?.error || error?.message;
    const webReportError =
      reportError?.response?.data?.message || reportError?.message;

    return (
      <ErrorPage
        description={webError || webReportError}
        onRetry={() => refetch() || refetchReport()}
      />
    );
  }

  // Render website data and report
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{data?.website?.url}</p>

        <Tag
          color={
            data?.website?.status === "up"
              ? "green"
              : data?.website?.status === "down"
              ? "red"
              : "gray"
          }
        >
          <p className="capitalize">{data?.website?.status}</p>
        </Tag>
      </div>

      <div className="w-full mb-5">
        {report ? (
          <Report report={report} logs={logs} />
        ) : (
          <Alert message="No report available" type="warning" showIcon />
        )}
      </div>
    </div>
  );
};

export default ViewWebsite;

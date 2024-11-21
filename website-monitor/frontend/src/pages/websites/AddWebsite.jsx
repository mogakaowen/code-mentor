import { useState, useEffect } from "react";
import { Input, Button, Form, message, Spin, InputNumber } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { queryClient } from "../../utils/localStorageService";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingPage } from "../../shared/Loading";

const getWebsiteData = async (id) => {
  try {
    const response = await axiosInstance.get(`/websites?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching website data:", error);
    throw error;
  }
};

const AddEditWebsite = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { mode, id } = useParams();
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("");

  // Fetch website details in edit mode
  const { data: websiteData, isLoading: isFetching } = useQuery({
    queryKey: ["websites", id],
    queryFn: () => getWebsiteData(id), // Use the external function here
    enabled: mode === "edit" && !!id, // Only fetch in edit mode
  });

  // Handle fetching website data for editing
  useEffect(() => {
    if (websiteData) {
      form.setFieldsValue({
        url: websiteData.website.url,
        interval: websiteData.website.interval,
      });
    }
  }, [websiteData, form]);

  // API call functions
  const addWebsiteMutation = async (data) => {
    const response = await axiosInstance.post("/websites/add", data);
    return response.data;
  };

  const editWebsiteMutation = async (data) => {
    const response = await axiosInstance.put(`/websites/edit/${id}`, data);
    return response.data;
  };

  const mutationFn = mode === "edit" ? editWebsiteMutation : addWebsiteMutation;

  // Mutation configuration
  const { mutate, isLoading } = useMutation({
    mutationKey: ["websites", mode === "edit" ? id : "add"],
    mutationFn,
    onMutate: async (newData) => {
      if (mode === "edit") {
        await queryClient.cancelQueries({ queryKey: ["websites", id] });

        // Snapshot of previous data
        const previousWebsite = queryClient.getQueryData(["websites", id]);

        // Optimistically update the cache
        queryClient.setQueryData(["websites", id], (oldData) => ({
          ...oldData,
          ...newData,
        }));

        return { previousWebsite };
      }
    },
    onError: (error, newData, context) => {
      if (mode === "edit" && context?.previousWebsite) {
        // Rollback cache to the previous state on error
        queryClient.setQueryData(["websites", id], context.previousWebsite);
      }

      const errorMessage =
        error.response?.data?.error || "Failed to process website";
      message.error(errorMessage);
    },
    onSuccess: (data) => {
      const successMessage =
        data?.message ||
        `${mode === "edit" ? "Website updated" : "Website added"} successfully`;
      message.success(successMessage);

      // Invalidate both the individual website and the list of websites
      queryClient.invalidateQueries({ queryKey: ["websites", id] });
      queryClient.invalidateQueries({ queryKey: ["websites"] });

      navigate("/websites");
    },
    onSettled: () => {
      if (mode === "edit") {
        queryClient.invalidateQueries({ queryKey: ["websites", id] }); // Ensure fresh data
      }
    },
  });

  const handleSubmit = (values) => {
    const formData = {
      url: values.url,
      interval: Number(values.interval),
    };

    mutate(formData);
  };

  if (isFetching) return <LoadingPage />;

  return (
    <div className="p-6 w-full">
      <p className="text-xl font-semibold">
        {mode === "edit" ? "Edit Website" : "Add New Website"}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        {mode === "edit"
          ? "Update the website details and monitoring settings."
          : "Add websites for monitoring and receive alerts for any changes or issues."}
      </p>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Website URL"
          name="url"
          rules={[{ required: true, message: "Please enter the website URL" }]}
        >
          <Input
            type="url"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="Check Interval (in minutes)"
          name="interval"
          rules={[
            { required: true, message: "Please enter the check interval" },
            { type: "number", message: "Interval must be a number" },
          ]}
        >
          <InputNumber
            placeholder="Enter check interval"
            className="w-full"
            value={interval}
            onChange={(value) => setInterval(value)}
          />
        </Form.Item>
        <Button
          className="py-2 h-full shadow-none"
          type="primary"
          htmlType="submit"
          loading={isLoading}
        >
          {isLoading ? (
            <Spin />
          ) : mode === "edit" ? (
            "Update Website"
          ) : (
            "Add Website"
          )}
        </Button>
      </Form>
    </div>
  );
};

export default AddEditWebsite;

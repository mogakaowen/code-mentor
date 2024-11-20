import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Form, notification, Spin } from "antd";
import "tailwindcss/tailwind.css"; // Ensure Tailwind is imported
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    navigate("/auth/signin");
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/forgot-password`,
        {
          email: values.email,
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Email Sent",
          description: response?.data?.message || "Email sent successfully.",
        });
      } else {
        notification.error({
          message: "Error",
          description:
            response?.data?.error || "There was an error sending the email.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.error || "Network error, please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-2">
        Have you forgotten your password?
      </h2>
      <p className="text-sm text-gray-500 text-center mb-4">
        Enter your email address below and we'll send you a link to reset your
        password.
      </p>
      <Form onFinish={handleSubmit} className="space-y-4">
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input a valid email.",
            },
          ]}
        >
          <Input placeholder="Email" className="w-full" />
        </Form.Item>

        <Form.Item>
          <div className="flex flex-col md:flex-row gap-1">
            <Button
              htmlType="button"
              className="w-full py-2 h-full shadow-none"
              onClick={handleNavigate}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full shadow-none py-2 h-full"
              loading={loading}
            >
              Continue
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from "react";
import { Input, Button, Form, notification, Result, Spin } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setErrorMessage("Invalid or expired token.");
    } else {
      setIsValidToken(true);
      setErrorMessage("");
    }
  }, [token]);

  const handleResetPassword = async (values) => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/reset-password/${token}`,
        {
          password: values.password,
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Password Reset Successful",
          description: response?.data?.message || "Password reset successful.",
        });
        history.push("/login"); // Redirect to login page after success
      } else {
        notification.error({
          message: "Error",
          description: response?.data?.error || "Invalid token.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.response?.data?.message || "An error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <Result
        status="error"
        title="Invalid Token"
        subTitle={errorMessage}
        extra={
          <Button type="primary" onClick={() => history.push("/")}>
            Go to Homepage
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <p className="text-2xl font-semibold text-center mb-4">Reset Password</p>
      <Form
        form={form}
        onFinish={handleResetPassword}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: "Please input your new password!" },
          ]}
        >
          <Input.Password placeholder="New Password" className="w-full" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject("Passwords do not match");
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" className="w-full" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-2 h-full shadow-none"
            loading={loading}
            disabled={loading}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;

import { useState } from "react";
import { Button, Form, Input, notification } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setSessionData } from "../utils/localStorageService";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/auth/signup");
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/login`,
        {
          email: values.email,
          password: values.password,
        }
      );
      notification.success({
        message: "Login Successful",
        description: response?.data?.message,
      });

      setSessionData({
        accessToken: response?.data?.accessToken,
        ...response?.data?.user,
      });

      // Save token or other session data as needed here
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      notification.error({
        message: "Login Failed",
        description:
          error?.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login"
      layout="vertical"
      onFinish={onFinish}
      className="space-y-4"
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Enter a valid email address" },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input.Password placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <div className="flex flex-col md:flex-row gap-1">
          <Button
            htmlType="button"
            className="w-full py-2 h-full shadow-none"
            onClick={handleNavigate}
            disabled={loading}
          >
            Signup
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-2 h-full shadow-none"
            loading={loading}
          >
            {loading ? "Signing in..." : "Signin"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default Login;

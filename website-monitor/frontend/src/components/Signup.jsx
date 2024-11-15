import axios from "axios";
import { Form, Input, Button, notification } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNavigate = () => {
    navigate("/auth/signin");
  };

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      // validate form
      await form.validateFields();
      const dataToPost = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await axios.post(`${baseUrl}/users/signup`, dataToPost);
      notification.success({
        message: "Signup Successful",
        description: response.data.message,
      });

      // Redirect to login page after successful signup
      navigate("/auth/signin");
    } catch (err) {
      console.log("error", err);
      notification.error({
        message: "Signup Failed",
        description:
          Array.isArray(err?.response?.data?.errors) &&
          err.response.data.errors.length > 0
            ? err.response.data.errors[0].msg
            : err?.response?.data?.error ||
              "An unknown error occurred. please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form name="signup" form={form} layout="vertical" onFinish={onFinish}>
      {/* Name */}
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please enter your name!" }]}
      >
        <Input
          placeholder="Enter your name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </Form.Item>

      {/* Username */}
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please enter your username!" }]}
      >
        <Input
          placeholder="Enter your username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
        />
      </Form.Item>

      {/* Email */}
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please enter your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input
          placeholder="Enter your email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </Form.Item>

      {/* Password */}
      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter your password!" }]}
      >
        <Input.Password
          placeholder="Enter your password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder="Confirm your password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <div className="flex flex-col md:flex-row gap-1">
          <Button
            htmlType="button"
            className="w-full py-2 h-full shadow-none"
            onClick={handleNavigate}
            disabled={isLoading}
          >
            Signin
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-2 h-full shadow-none"
            loading={isLoading}
          >
            Signup
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default Signup;

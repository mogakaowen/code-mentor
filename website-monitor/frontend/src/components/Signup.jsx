import { Form, Input, Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNavigate = () => {
    navigate("/auth/signin");
  };

  const onFinish = () => {};

  return (
    <Form name="signup" layout="vertical" onFinish={onFinish}>
      {/* Name */}
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please enter your name!" }]}
      >
        <Input
          placeholder="Enter your name"
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
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <div className="flex flex-col md:flex-row gap-1">
          <Button
            type="primary"
            htmlType="button"
            className="w-full shadow-none"
            onClick={handleNavigate}
          >
            Signin
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full shadow-none"
          >
            Signup
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default Signup;

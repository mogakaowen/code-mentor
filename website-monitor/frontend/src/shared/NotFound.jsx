import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-600">Page Not Found</p>
      <Button
        type="primary"
        className="mt-4 shadow-none"
        onClick={() => navigate("/dashboard")}
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;

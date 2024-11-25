import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input } from "antd";
import { deleteUser, getSessionData } from "../../utils/localStorageService";

const ProfilePage = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const userData = getSessionData();
    setSession(userData);
  }, []);

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Are you sure you want to delete your account?",
      content:
        "This action cannot be undone. Your data will be permanently removed.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        // Simulate account deletion
        await deleteUser();
        window.location.href = "/auth/signin";
      },
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-lg">
      {/* Display User Information using Ant Design Form */}
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input value={session?.name} readOnly />
        </Form.Item>
        <Form.Item label="Username">
          <Input value={session?.username} readOnly />
        </Form.Item>
        <Form.Item label="Email">
          <Input value={session?.email} readOnly />
        </Form.Item>
      </Form>

      {/* Delete Account Button */}
      <Button
        type="primary"
        danger
        className="w-full mt-6 shadow-none"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </Button>
    </div>
  );
};

export default ProfilePage;

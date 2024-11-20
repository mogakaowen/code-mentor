import React from "react";
import { Layout, Menu, Button } from "antd";
import { Link } from "react-router-dom";
import LottieAnimation from "../shared/LottiePlayer";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const items = [
    {
      key: "1",
      label: <Link to="/websites">Websites</Link>,
    },
    {
      key: "2",
      label: <Link to="/analytics">Analytics</Link>,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Navbar */}
      <Header className="flex justify-between items-center bg-white shadow-md px-6">
        {/* Left: Logo and Monitor Name */}
        <div className="flex items-center space-x-2">
          <LottieAnimation
            animation="/logoProfile.lottie"
            width="50px"
            height="50px"
          />
          <span className="text-lg font-semibold text-gray-800">
            Website Monitor
          </span>
        </div>

        {/* Middle: Navigation Links */}
        <Menu
          mode="horizontal"
          className="flex-grow justify-center border-none"
          items={items}
        />

        {/* Right: Logout Button */}
        <Button type="primary" className="shadow-none" danger>
          Logout
        </Button>
      </Header>

      {/* Content Area */}
      <Content className="p-6 bg-gray-100">{children}</Content>

      {/* Footer */}
      <Footer className="text-center bg-white shadow-md py-4">
        © {new Date().getFullYear()} Website Monitor. All Rights Reserved.
      </Footer>
    </Layout>
  );
};

export default MainLayout;

import React, { useEffect, useCallback, useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LottieAnimation from "../shared/LottiePlayer";
import { getSessionData, logoutUser } from "../utils/localStorageService";

const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSessionData();

  const [currentKey, setCurrentKey] = useState(
    localStorage.getItem("currentMenuKey") || "profile"
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    navigate("/auth/signin", { replace: true });
  }, [navigate]);

  const handleNavigate = () => {
    navigate("/profile");
  };

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    if (!session?.accessToken) {
      // If no valid session, log out and redirect
      handleLogout();
    }
  }, [session, handleLogout]);

  useEffect(() => {
    const pathToKey = {
      "/websites": "websites",
      "/analytics": "analytics",
      "/dashboard": "dashboard",
    };

    const baseRoute = Object.keys(pathToKey)
      .sort((a, b) => b.length - a.length) // Sort paths by length, longest first
      .find((path) => location.pathname.startsWith(path)); // Find the first match

    const matchedKey = pathToKey[baseRoute];
    setCurrentKey(matchedKey);
    localStorage.setItem("currentMenuKey", matchedKey);
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const items = [
    {
      key: "dashboard",
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "websites",
      label: <Link to="/websites">Websites</Link>,
    },
    {
      key: "analytics",
      label: <Link to="/analytics">Analytics</Link>,
    },
  ];

  return (
    <Layout className="min-h-screen w-full max-w-[80rem]">
      {/* Navbar */}
      <Header className="flex justify-between items-center bg-white shadow-md px-6">
        {/* Left: Logo and Monitor Name */}
        <div
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
          onClick={handleNavigate}
        >
          <LottieAnimation
            animation="/logoProfile.lottie"
            width="50px"
            height="50px"
          />
          <span className="text-lg font-semibold text-gray-800">
            {session?.username}
          </span>
        </div>

        {/* Middle: Responsive Navigation */}
        {!isMobile && (
          <div>
            <Menu
              mode="horizontal"
              className="flex-grow justify-center border-none"
              selectedKeys={[currentKey]}
              items={items}
            />
          </div>
        )}

        {/* Hamburger Menu for Small Screens */}
        <Button
          type="text"
          className="md:hidden"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
        />

        {/* Right: Logout Button */}
        <Button
          type="primary"
          className="hidden md:block shadow-none"
          danger
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Header>

      {/* Drawer for Small Screens */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={"70vw"}
      >
        <Menu
          mode="vertical"
          selectedKeys={[currentKey]}
          items={items}
          onClick={() => setDrawerVisible(false)} // Close drawer after selection
        />
        <Button
          type="primary"
          danger
          className="w-full mt-4"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Drawer>

      {/* Content Area */}
      <Content className="p-6 bg-gray-100 w-full">{children}</Content>

      {/* Footer */}
      <Footer className="text-center bg-white shadow-md py-4">
        &copy; {new Date().getFullYear()} Website Monitor. All Rights Reserved.
      </Footer>
    </Layout>
  );
};

export default MainLayout;

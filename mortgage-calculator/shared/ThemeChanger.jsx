import { Button, Drawer, Switch } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../store/theme-context"; // Assuming you have a ThemeContext

const ThemeToggler = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState("30%"); // Default width for larger screens

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setDrawerWidth("50%");
      } else {
        setDrawerWidth("30%");
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <div>
      <Button
        icon={<SettingOutlined />}
        style={{
          position: "fixed",
          right: "0px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
          background: "transparent",
        }}
        onClick={toggleDrawer}
      />

      <Drawer
        title="Toggle Light and Dark Mode"
        placement="right"
        onClose={toggleDrawer}
        open={drawerVisible}
        width={drawerWidth}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg">Dark Mode</p>
          <Switch
            checked={theme === "dark"}
            onChange={toggleTheme}
            className="ml-4"
          />
        </div>
      </Drawer>
    </div>
  );
};

export default ThemeToggler;

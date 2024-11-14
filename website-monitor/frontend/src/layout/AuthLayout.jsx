import { useEffect, useState } from "react";
import bgImage from "../assets/bgThree.jpg";

const AuthLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {!collapsed && (
        <div
          className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-md w-full max-w-md">
            {children}
          </div>
        </div>
      )}

      {collapsed && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="p-8 rounded-lg w-full max-w-md">{children}</div>
        </div>
      )}
    </>
  );
};

export default AuthLayout;

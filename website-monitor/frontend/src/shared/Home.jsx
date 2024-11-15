import { Button } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const Home = () => {
  const navigate = useNavigate();

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    visible: { transition: { staggerChildren: 0.3 } },
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <div className="flex justify-between items-center px-8 py-4 bg-opacity-10">
        <motion.h1
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to Website Monitor
        </motion.h1>
        <div className="flex gap-4">
          <Button
            type="link"
            className="font-semibold hover:underline"
            onClick={() => navigate("/auth/signin")}
          >
            Login
          </Button>
          <Button
            type="primary"
            className="font-semibold rounded-full shadow-none"
            onClick={() => navigate("/auth/signup")}
          >
            Sign Up
          </Button>
        </div>
      </div>

      {/* Main Intro Section */}
      <motion.div
        className="flex flex-col items-center justify-center h-[80vh] text-center px-4 md:px-0"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2
          className="text-4xl md:text-6xl font-bold mb-6"
          variants={fadeInUp}
        >
          Your Ultimate Website Monitoring Solution
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl mb-8 max-w-2xl"
          variants={fadeInUp}
        >
          Ensure your website is always online and performing at its best. Get
          notified instantly if any issues arise.
        </motion.p>

        {/* Animated Icons */}
        <div className="flex gap-8 mt-6">
          <motion.div
            className="flex flex-col items-center"
            variants={fadeInUp}
          >
            <UserOutlined className="text-4xl md:text-5xl mb-2" />
            <p>24/7 Monitoring</p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center"
            variants={fadeInUp}
          >
            <CheckCircleOutlined className="text-4xl md:text-5xl mb-2" />
            <p>Reliable Uptime</p>
          </motion.div>
          <motion.div
            className="flex flex-col items-center"
            variants={fadeInUp}
          >
            <EyeOutlined className="text-4xl md:text-5xl mb-2" />
            <p>Real-time Alerts</p>
          </motion.div>
        </div>

        {/* Call-to-Action Button */}
        <motion.div variants={fadeInUp} className="mt-12">
          <Button
            type="primary"
            size="large"
            className="bg-white text-blue-500 px-8 py-3 font-semibold rounded-full hover:bg-gray-200"
            onClick={() => navigate("/get-started")}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;

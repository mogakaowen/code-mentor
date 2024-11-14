import { Spin } from "antd";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" />
    </div>
  );
};

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-2">
        {/* Bouncing Dots with Continuous Movement */}
        <div className="flex justify-center items-center space-x-3">
          <div className="w-6 h-6 bg-blue-800 rounded-full animate-dotMove1"></div>
          <div className="w-6 h-6 bg-blue-800 rounded-full animate-dotMove2"></div>
          <div className="w-6 h-6 bg-blue-800 rounded-full animate-dotMove3"></div>
        </div>

        {/* Loading Text */}
        <p className="text-2xl font-semibold text-blue-800 animate-pulse">
          Loading...
        </p>

        {/* Sub-text */}
        <p className="text-sm text-blue-600 opacity-80 animate-fade">
          Please wait while we set things up
        </p>
      </div>
    </div>
  );
};

export { Loader, LoadingPage };

import { Button } from "antd";
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Login />
      <div className="flex items-center justify-center mt-2">
        <Button
          type="link"
          className="font-semibold hover:underline"
          onClick={() => navigate("/auth/signin")}
        >
          Forgot password?
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;

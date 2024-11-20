import { useEffect, useState } from "react";
import { notification } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { LoadingPage } from "../../shared/Loading";

const VerifyUserPage = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Add a 5-second delay to simulate the verification process
    const verifyUser = async () => {
      try {
        // Simulate delay using setTimeout
        setTimeout(async () => {
          try {
            const response = await axios.put(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/users/verify/${userId}/${token}`
            );

            // If verification is successful, show success message and navigate
            notification.success({
              message: "Verification Successful",
              description: response.data.message,
            });

            // Redirect to the login page after successful verification
            setTimeout(() => navigate("/auth/signin"), 3000);
          } catch (error) {
            setErrorMessage(error?.response?.data?.error);
            setError(true); // Set error to true if verification fails
          } finally {
            setLoading(false); // End loading after timeout
          }
        }, 2000);
      } catch (error) {
        console.error("error", error);
        setError(true);
        setLoading(false);
      }
    };

    verifyUser();
  }, [userId, token, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      {loading && <LoadingPage />} {/* Show loading spinner while waiting */}
      {error && !loading && (
        <div className="text-center">
          <h1 className="text-2xl text-red-500">Verification Failed</h1>
          <p className="text-gray-600">
            {errorMessage || "The verification link is invalid or has expired."}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyUserPage;

import { useNavigate } from "react-router-dom";
import { Button, notification } from "antd"; // Added notification
import { GoogleOutlined } from "@ant-design/icons";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import Login from "../components/Login";
import { auth } from "../utils/firebase";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    // Force account selection by setting prompt parameter
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);

      if (!result) return;

      // Extract Google credential and access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleToken = credential?.accessToken;

      // Extract signed-in user information
      const user = result.user;
      const idToken = await user.getIdToken();

      // Send idToken to the server for verification
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, googleToken }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Server response:", data);

      // Handle success (e.g., save user session, navigate to another page)
    } catch (error) {
      // Handle errors
      if (error.code === "auth/account-exists-with-different-credential") {
        alert(
          "You have already signed up with a different auth provider for that email."
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        console.warn("Popup closed by user before completing sign-in.");
      } else {
        console.error("Authentication error:", error.message, error.code);
      }
    }
  };

  return (
    <div>
      <Login />

      <div className="flex justify-center mt-2 text-sm">OR</div>

      {/* Google Sign-In Button */}
      <div className="flex items-center justify-center mt-2">
        <Button
          icon={<GoogleOutlined />} // Use Google icon from Ant Design
          onClick={handleGoogleSignIn}
          size="large"
          className="google-signin-btn"
          block
        >
          Continue with Google
        </Button>
      </div>

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

import { useNavigate } from "react-router-dom";
import { Button, notification } from "antd"; // Added notification
import { GoogleOutlined } from "@ant-design/icons";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import Login from "../components/Login";
import { useState } from "react";

// Firebase config setup...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      // Extract ID Token after successful login
      const idToken = await result.user.getIdToken();

      // Send the ID token to the server for verification
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/google-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        }
      );

      const data = await response.json();
      console.log("data", data);

      // Check the server's response and navigate if successful
      if (response.ok) {
        navigate("/dashboard"); // Redirect to the dashboard or another page
      } else {
        notification.error({
          message: "Login Failed",
          description:
            data.message || "An error occurred during Google sign-in.",
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      notification.error({
        message: "Google Sign-In Failed",
        description:
          error.message || "An error occurred during Google sign-in.",
      });
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

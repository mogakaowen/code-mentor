import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader, LoadingPage } from "./shared/Loading";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import Home from "./shared/Home";

// Lazy load the SignupPage component
const SignupPage = lazy(() => import("./pages/Signup"));
const LoginPage = lazy(() => import("./pages/Login"));
const VerifyUser = lazy(() => import("./pages/VerifyUser"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/auth/verify/:userId/:token" element={<VerifyUser />} />

        {/* Main Routes with Suspense for dynamic components */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingPage />}>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  {/* Add other main routes here */}
                </Routes>
              </MainLayout>
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

const AuthRoutes = () => {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Routes>
      </Suspense>
    </AuthLayout>
  );
};

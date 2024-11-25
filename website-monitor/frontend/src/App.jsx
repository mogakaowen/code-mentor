import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/localStorageService";

import { Loader } from "./shared/Loading";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";

// Lazy-loaded components
const Home = lazy(() => import("./shared/Home"));
const Dashboard = lazy(() => import("./shared/Dashboard"));
const SignupPage = lazy(() => import("./pages/auth/Signup"));
const LoginPage = lazy(() => import("./pages/auth/Login"));
const VerifyUser = lazy(() => import("./pages/auth/VerifyUser"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPassword"));

const Analytics = lazy(() => import("./pages/websites/Analytics"));
const WebsitesPage = lazy(() => import("./pages/websites/WebsiteList"));
const AddEditWebsitePage = lazy(() => import("./pages/websites/AddWebsite"));
const ViewWebsitePage = lazy(() => import("./pages/websites/ViewWebsite"));
const ProfilePage = lazy(() => import("./pages/auth/Profile"));
const NotFound = lazy(() => import("./shared/NotFound")); // Import the NotFound component

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route path="/auth/verify/:userId/:token" element={<VerifyUser />} />
          <Route path="/" element={<Home />} />

          {/* Main Routes with Suspense for dynamic components */}
          <Route
            path="*"
            element={
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route
                    path="/*"
                    element={
                      <MainLayout>
                        <Routes>
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/websites" element={<WebsitesPage />} />
                          <Route
                            path="/websites-add"
                            element={<AddEditWebsitePage />}
                          />
                          <Route
                            path="/websites/:mode/:id?"
                            element={<AddEditWebsitePage />}
                          />
                          <Route
                            path="/websites/view/:id"
                            element={<ViewWebsitePage />}
                          />
                          <Route path="*" element={<NotFound />} />{" "}
                          {/* 404 for main routes */}
                        </Routes>
                      </MainLayout>
                    }
                  />
                  {/* Add other main routes here */}
                </Routes>
              </Suspense>
            }
          />

          {/* Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <Suspense fallback={<Loader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
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

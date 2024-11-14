import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader, LoadingPage } from "./shared/Loading";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";

// Lazy load the SignupPage component
const SignupPage = lazy(() => import("./pages/Signup"));
const VerifyUser = lazy(() => import("./pages/VerifyUser"));

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
                  <Route path="/" element={<h1>Home</h1>} />
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
        </Routes>
      </Suspense>
    </AuthLayout>
  );
};

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import { useContext } from "react";
import { ThemeContext } from "../store/theme-context";
import ThemeToggler from "../shared/ThemeChanger";
import { HelmetProvider } from "react-helmet-async";

function App() {
  const { theme: currentTheme } = useContext(ThemeContext);

  return (
    <HelmetProvider>
      <ConfigProvider
        theme={{
          algorithm:
            currentTheme === "light"
              ? theme.defaultAlgorithm
              : theme.darkAlgorithm,
        }}
      >
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
            <ThemeToggler />
          </MainLayout>
        </BrowserRouter>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;

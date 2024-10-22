import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import { useContext } from "react";
import { ThemeContext } from "../store/theme-context";
import ThemeToggler from "../shared/ThemeChanger";

function App() {
  const { theme: currentTheme } = useContext(ThemeContext);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === "light"
            ? theme.defaultAlgorithm
            : theme.darkAlgorithm,
      }}
    >
      <MainLayout>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>

        <ThemeToggler />
      </MainLayout>
    </ConfigProvider>
  );
}

export default App;

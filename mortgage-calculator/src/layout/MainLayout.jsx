import { HelmetProvider } from "react-helmet-async";
import SeoHelmet from "../components/SeoHelmet";

import Navbar from "./NavBar";

const MainLayout = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-auto">
      <HelmetProvider>
        <SeoHelmet
          title="Mortgage Calculator - Your Home Financing Solution"
          description="Use our mortgage calculator to estimate your monthly payments and find the best mortgage rates for your home."
          keywords="mortgage calculator, home financing, mortgage rates, loan estimator, loan calculator, mortgage payment calculator, Kenya, Nairobi, Mombasa"
          url="https://yourwebsite.com/mortgage-calculator"
        />
      </HelmetProvider>
      <Navbar />

      <div className="p-2">{children}</div>
    </div>
  );
};

export default MainLayout;

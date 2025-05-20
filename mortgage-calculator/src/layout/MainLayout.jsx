import SeoHelmet from "../components/SeoHelmet";
import Navbar from "./NavBar";

const MainLayout = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen overflow-auto">
      <SeoHelmet
        title="Mortgage Calculator - Your Home Financing Solution"
        description="Use our mortgage calculator to estimate your monthly payments and find the best mortgage rates for your home."
        keywords="mortgage calculator, home financing, mortgage rates, loan estimator, loan calculator, mortgage payment calculator, Kenya, Nairobi, Mombasa"
        url="https://mortgage-calculator-v123.netlify.app/"
        ogImage="https://mortgage-calculator-v123.netlify.app/mortgage.jpg"
      />
      <Navbar />
      <div className="p-2">{children}</div>
    </div>
  );
};

export default MainLayout;

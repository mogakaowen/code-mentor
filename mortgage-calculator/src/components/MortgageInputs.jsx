import { Slider, InputNumber } from "antd";
import { useState } from "react";
import "./MortgageInputs.css"; // Custom CSS file for slider styles

const MortgageInputs = ({ formData, setFormData }) => {
  const handlePurchasePriceChange = (value) => {
    setFormData((prevData) => ({ ...prevData, purchasePrice: value }));
  };

  const handleDownPaymentChange = (value) => {
    setFormData((prevData) => ({ ...prevData, downPayment: value }));
  };

  const handleRepaymentTimeChange = (value) => {
    setFormData((prevData) => ({ ...prevData, repaymentTime: value }));
  };

  const handleInterestRateChange = (value) => {
    setFormData((prevData) => ({ ...prevData, interestRate: value }));
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Purchase Price Field */}
      <div>
        <div className="mb-4">
          <strong>Purchase Price: </strong>KES {formData.purchasePrice}
        </div>
        <div className="flex items-center">
          <Slider
            min={0}
            max={1000000000}
            onChange={handlePurchasePriceChange}
            value={formData.purchasePrice}
            className="custom-slider flex-1"
          />
          <InputNumber
            min={0}
            max={1000000000}
            value={formData.purchasePrice}
            onChange={handlePurchasePriceChange}
            formatter={(value) =>
              `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/KES\s?|,/g, "")}
            className="ml-4 w-36"
          />
        </div>
      </div>

      {/* Down Payment Field */}
      <div>
        <div className="mb-4">
          <strong>Down Payment: </strong>KES {formData.downPayment}
        </div>
        <div className="flex items-center">
          <Slider
            min={0}
            max={formData.purchasePrice} // Adjust max to purchase price
            onChange={handleDownPaymentChange}
            value={formData.downPayment}
            className="custom-slider flex-1"
          />
          <InputNumber
            min={0}
            max={formData.purchasePrice} // Adjust max to purchase price
            value={formData.downPayment}
            onChange={handleDownPaymentChange}
            formatter={(value) =>
              `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/KES\s?|,/g, "")}
            className="ml-4 w-36"
          />
        </div>
      </div>

      {/* Repayment Time Field */}
      <div>
        <div className="mb-4">
          <strong>Repayment Time (Years): </strong>
          {formData.repaymentTime}
        </div>
        <div className="flex items-center">
          <Slider
            min={0}
            max={30} // Set an appropriate range for years
            onChange={handleRepaymentTimeChange}
            value={formData.repaymentTime}
            className="custom-slider flex-1"
          />
          <InputNumber
            min={0}
            max={30}
            value={formData.repaymentTime}
            onChange={handleRepaymentTimeChange}
            className="ml-4 w-36"
          />
        </div>
      </div>

      {/* Interest Rate Field */}
      <div>
        <div className="mb-4">
          <strong>Interest Rate (%): </strong>
          {formData.interestRate}
        </div>
        <div className="flex items-center">
          <Slider
            min={0}
            max={20} // Set a maximum interest rate limit
            onChange={handleInterestRateChange}
            value={formData.interestRate}
            className="custom-slider flex-1"
          />
          <InputNumber
            min={0}
            max={20}
            value={formData.interestRate}
            onChange={handleInterestRateChange}
            className="ml-4 w-36"
          />
        </div>
      </div>
    </div>
  );
};

export default MortgageInputs;

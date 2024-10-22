import { Card, Button } from "antd";
import { useState } from "react";
import MortgageInputs from "./MortgageInputs";
import MortgageResults from "./MortgageResults";

const Calculator = () => {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    purchasePrice: 0,
    downPayment: 0,
    repaymentTime: 0,
    interestRate: 0,
  });
  const [results, setResults] = useState([]);

  const calculateMortgage = () => {
    const { purchasePrice, downPayment, repaymentTime, interestRate } =
      formData;

    const P = purchasePrice - downPayment; // Principal loan amount
    const r = interestRate / 100 / 12; // Monthly interest rate
    const n = repaymentTime * 12; // Number of payments (months)

    // Mortgage payment formula
    const M = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // Set the results and show them
    const newResults = [
      {
        purchasePrice,
        downPayment,
        loanAmount: P,
        repaymentTime,
        interestRate,
        monthlyPayment: M > 0 ? M.toFixed(2) : 0,
      },
    ];

    setResults(newResults); // Update the results
    setShowResults(true); // Show results

    console.log(newResults);
  };

  return (
    <div className="flex items-center justify-center">
      <Card
        title="Mortgage Calculator"
        className="w-full max-w-2xl p-4 shadow-md rounded-xl border-0"
      >
        {!showResults && (
          <>
            <MortgageInputs formData={formData} setFormData={setFormData} />
            <Button
              className="mt-20 shadow-none"
              type="primary"
              onClick={calculateMortgage}
            >
              Get Mortgage Quote
            </Button>
          </>
        )}
        {showResults && (
          <>
            <MortgageResults results={results} />
            <Button
              className="mt-20 shadow"
              type="primary"
              onClick={() => setShowResults(false)}
            >
              Calculate Another Mortgage
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Calculator;

const MortgageResults = ({ results }) => {
  if (!results.length) {
    return (
      <>
        <div className="text-center text-red-500">No results to display</div>
      </>
    );
  }

  const {
    purchasePrice,
    downPayment,
    loanAmount,
    repaymentTime,
    interestRate,
    monthlyPayment,
  } = results[0]; // Assuming results always has one entry based on previous code

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">Purchase Price:</span>
          <span>KES {purchasePrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Down Payment:</span>
          <span>KES {downPayment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Loan Amount:</span>
          <span>KES {loanAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Repayment Time:</span>
          <span>{repaymentTime} years</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Interest Rate:</span>
          <span>{interestRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Estimated Monthly Payment:</span>
          <span>KES {monthlyPayment.toLocaleString()}</span>
        </div>
      </div>
    </>
  );
};

export default MortgageResults;

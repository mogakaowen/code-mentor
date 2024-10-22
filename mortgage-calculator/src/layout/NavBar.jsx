import React from "react";

const Navbar = () => {
  return (
    <header className="bg-gray-800 p-4">
      <div className="text-center mb-2">
        <h1 className="text-2xl text-white font-bold">Mortgage Calculator</h1>
      </div>
      <div className="mt-2 text-gray-200 text-center">
        <strong>Welcome to the Mortgage Calculator!</strong>
        <p>
          Use this tool to calculate your mortgage payments based on the
          purchase price, down payment, repayment time, and interest rate.
        </p>
      </div>
    </header>
  );
};

export default Navbar;

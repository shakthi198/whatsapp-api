import { useState } from "react";
import { HiChevronRight } from "react-icons/hi";
import { LuDownload } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import TransactionsUI from "./TransactionsUI";
import PaymentDialog from "./PaymentDialog";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Billing = () => {
  const [activeTab, setActiveTab] = useState("billings"); // Default tab
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]); // Store transactions

  return (
    <div
      className="max-w-7xl mx-auto p-4 md:p-6"
      style={{ fontFamily: "'Montserrat'" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h1 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">
            Billing
          </h1>
          <div className="flex items-center text-xs md:text-sm text-gray-600 flex-wrap">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Billing</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-300">
        <button
          className={`px-4 md:px-6 py-2 text-sm md:text-md ${
            activeTab === "billings"
              ? "text-yellow-600 border-b-2 cursor-pointer border-yellow-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("billings")}
        >
          Billings
        </button>

        <button
          className={`px-4 md:px-6 py-2 text-sm md:text-md ${
            activeTab === "transactions"
              ? "text-yellow-600 border-b-2 cursor-pointer border-yellow-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "billings" && (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded shadow-md flex flex-col md:flex-row gap-3 md:gap-6 items-stretch md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <select className="border border-gray-300 p-2 rounded text-gray-600 w-full sm:w-48">
                  <option value="all">All</option>
                </select>
                <input
                  type="text"
                  placeholder="Search tag"
                  className="border border-gray-300 p-2 rounded text-gray-600 w-full sm:w-56"
                />
              </div>

              <button className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto">
                <LuDownload className="mr-2" /> Export
              </button>
            </div>

            {/* Balance Section */}
            <div className="bg-white p-6 rounded-b-md shadow-md w-full flex flex-col items-center justify-center mt-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
                Balance
              </h3>

              {/* Date Range */}
              <div className="flex flex-col sm:flex-row items-center border border-gray-300 bg-white text-base px-2 py-2 rounded-md shadow-md w-full sm:w-auto">
                <input
                  type="text"
                  className="text-gray-500 p-2 outline-none border-none bg-transparent w-full sm:w-auto"
                  placeholder="Start date"
                />
                <span className="hidden sm:inline text-gray-500 mx-2">→</span>
                <input
                  type="text"
                  className="text-gray-500 p-2 outline-none border-none bg-transparent w-full sm:w-auto"
                  placeholder="End date"
                />
                <span className="text-gray-400 ml-2">
                  <CiCalendar size={24} />
                </span>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 w-full">
                {["MC", "UC", "AC", "BIC", "SM", "Total"].map((type) => (
                  <div
                    key={type}
                    className="bg-gray-100 p-8 md:p-12 rounded shadow-md text-center border border-gray-300"
                  >
                    <p className="text-lg md:text-xl font-bold">₹0.00</p>
                    <p className="text-gray-600 mt-4 text-sm md:text-lg">
                      {type} Central Balance Usage
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "transactions" && (
          <div>
            {/* Add Transaction Button */}
            <div className="flex flex-col sm:flex-row justify-end mb-4">
              <button
                className="px-4 py-2 rounded text-white bg-green-500 w-full sm:w-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                Start Transaction
              </button>
            </div>

            {/* Transactions Table */}
            <TransactionsUI transactions={transactions} />

            {/* Payment dialog */}
            <PaymentDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              addTransaction={(transaction) => {
                const txnWithIdAndDate = {
                  ...transaction,
                  transaction_id: "TXN" + Date.now(), // unique temp ID
                  date_time: new Date().toLocaleString(),
                };
                setTransactions((prev) => [txnWithIdAndDate, ...prev]); // prepend new txn
                setIsDialogOpen(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Toast */}
      <ToastContainer />
    </div>
  );
};

export default Billing;

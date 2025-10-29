import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import TransactionsUI from "./TransactionsUI";
import PaymentDialog from "./PaymentDialog";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
const Billing = () => {
  const [activeTab, setActiveTab] = useState("billings");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

  return (
    <div
      className="w-full py-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">
          Billings
        </h2>
        <div className="flex items-center flex-nowrap text-yellow-600 text-md gap-1">
          <div className="flex items-center text-lg text-gray-600 flex-wrap gap-1">
            <span className="hidden md:inline">|</span>
          </div>
          <span className="whitespace-nowrap">Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="whitespace-nowrap">Billings</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-300 text-sm sm:text-base">
        {[
          { key: "billings", label: "Billings" },
          { key: "transactions", label: "Transactions" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 sm:px-6 py-2 font-medium transition-colors ${
              activeTab === tab.key
                ? "text-yellow-600 border-b-2 border-yellow-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="mt-6">
        {activeTab === "billings" && (
          <>
            {/* Filters */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <select className="border border-gray-300 p-2 rounded text-gray-600 w-full sm:w-48 focus:ring-2 focus:ring-yellow-400 outline-none">
                  <option value="all">All</option>
                </select>
                <input
                  type="text"
                  placeholder="Search tag"
                  className="border border-gray-300 p-2 rounded text-gray-600 w-full sm:w-56 focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto transition-colors">
                <LuDownload className="mr-2" /> Export
              </button>
            </div>

            {/* Balance Section */}
            <div className="bg-white mt-6 p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Balance
              </h3>

              {/* Date Range */}
              <div className="flex flex-col sm:flex-row items-center justify-center border border-gray-300 bg-white px-3 py-2 rounded-md shadow-sm max-w-xs sm:max-w-md mx-auto">
                <input
                  type="text"
                  className="text-gray-500 p-2 outline-none border-none bg-transparent w-full lg:w-auto"
                  placeholder="Start date"
                />
                <span className="hidden sm:inline text-gray-500 mx-2">→</span>
                <input
                  type="text"
                  className="text-gray-500 p-2 outline-none border-none bg-transparent w-full lg:w-auto"
                  placeholder="End date"
                />
                <CiCalendar className="text-gray-400 ml-2" size={22} />
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
                {["MC", "UC", "AC", "BIC", "SM", "Total"].map((type) => (
                  <div
                    key={type}
                    className="bg-gray-100 p-6 sm:p-8 rounded-lg shadow text-center border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <p className="text-lg sm:text-xl font-bold text-gray-800">
                      ₹0.00
                    </p>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
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
            {/* Add Transaction */}
            <div className="flex flex-col sm:flex-row justify-end mb-4">
              <button
                className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 w-full sm:w-auto transition-colors"
                onClick={() => setIsDialogOpen(true)}
              >
                Start Transaction
              </button>
            </div>

            {/* Transactions Table */}
            <TransactionsUI transactions={transactions} />

            {/* Payment Dialog */}
            <PaymentDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              addTransaction={(transaction) => {
                const txnWithMeta = {
                  ...transaction,
                  transaction_id: "TXN" + Date.now(),
                  date_time: new Date().toLocaleString(),
                };
                setTransactions((prev) => [txnWithMeta, ...prev]);
                setIsDialogOpen(false);
              }}
            />
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Billing;

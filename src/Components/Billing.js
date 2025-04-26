import { useState } from "react";
import { HiChevronRight } from "react-icons/hi";
import { LuDownload } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import { MdOutlineInbox } from "react-icons/md";
import TransactionsUI from "../Components/TransactionsUI";

const Billing = () => {
  const [activeTab, setActiveTab] = useState("billings"); // Default tab

  return (
    <div className="min-h-screen p-6">
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Billing</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">Billing</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-300">
        <button
          className={`px-6 py-2 text-md ${
            activeTab === "billings" ? "text-[#DDA853] border-b-2 border-yellow-500 " : "text-gray-500"
          }`}
          onClick={() => setActiveTab("billings")}
        >
          Billings
        </button>

        <button
          className={`px-6 py-2 text-md ${
            activeTab === "transactions" ? "text-[#DDA853] border-b-2 border-yellow-500 " : "text-gray-500"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      {/* Conditional UI Rendering */}
      <div className="mt-6">
        {activeTab === "billings" && (
          <>
            {/* Filters and Export Button */}
            <div className="bg-white p-4 rounded shadow-md flex items-center justify-between">
              {/* Left Side: Filters */}
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 p-2 rounded text-gray-600 w-72">
                  <option value="all">All</option>
                </select>
                <input type="text" placeholder="Search tag" className="border border-gray-300 p-2 rounded text-gray-600 w-56" />
              </div>

              {/* Right Side: Export Button */}
              <button className="bg-[#DDA853] text-white px-4 py-2 rounded flex items-center">
                <LuDownload className="mr-2" /> Export
              </button>
            </div>

            {/* Balance Section */}
            <div className="bg-white p-6 rounded-b-md shadow-md w-full flex flex-col items-center justify-center">
              {/* Balance Title */}
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Balance</h3>

              {/* Date Picker */}
              <div className="flex items-center border border-gray-300 bg-white text-lg px-2 py-2 rounded-md shadow-md">
                <input type="text" className="text-gray-500 p-2 outline-none border-none bg-transparent" placeholder="Start date" />
                <span className="text-gray-500 mx-2">→</span>
                <input type="text" className="text-gray-500 p-2 outline-none border-none bg-transparent" placeholder="End date" />
                <span className="text-gray-400 ml-2"><CiCalendar size={24}/></span>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 w-full">
                {["MC", "UC", "AC", "BIC", "SM", "Total"].map((type) => (
                  <div
                    key={type}
                    className="bg-gray-100 p-12 rounded shadow-md text-center border border-gray-300"
                  >
                    <p className="text-xl font-bold">₹0.00</p>
                    <p className="text-gray-600 mt-4 text-lg">{type} Central Balance Usage</p>
                  </div>
                ))}
              </div>

              {/* Table Section */}
              <div className="bg-white p-6 rounded-b-md shadow-md w-full">
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-gray-600 font-medium">
                        {["S. No.", "Hour Data", "Marketing Usage", "Service Usage", "Utility Usage", "Authentication Usage"]
                          .map((heading, index, arr) => (
                            <th key={index} 
                              className={`text-left px-4 py-6 text-sm text-gray-600 font-medium ${
                                index !== arr.length - 1 ? "border-r border-gray-300" : ""
                              }`}>
                              {heading}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* No Data State */}
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">
                          <MdOutlineInbox className="mx-auto text-gray-400 mt-6" size={72}/>
                          <p>No data</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "transactions" && <TransactionsUI />}
      </div>
    </div>
  );
};

export default Billing;
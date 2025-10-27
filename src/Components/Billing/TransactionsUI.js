import React, { useEffect, useState } from "react";
import { MdOutlineInbox } from "react-icons/md";
import axios from "axios";
import apiEndpoints from "../../apiconfig";


const TransactionsUI = () => {
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${apiEndpoints.transaction}`);
      if (res.data.status === "success") {
        setTransactions(res.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full overflow-hidden">
      {/* Table View (medium and larger screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              {[
                "S.No.",
                "Transaction ID",
                "Customer Name",
                "Amount",
                "GST",
                "Total Amount",
                "Date & Time",
                "Status",
              ].map((header, index, arr) => (
                <th
                  key={header}
                  className={`py-3 px-4 text-xs lg:text-sm text-gray-700 font-semibold text-left whitespace-nowrap ${
                    index !== arr.length - 1 ? "border-r border-gray-300" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn, idx) => (
                <tr
                  key={txn.transaction_id}
                  className="border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4">{txn.transaction_id}</td>
                  <td className="py-2 px-4">{txn.customer_name}</td>
                  <td className="py-2 px-4">₹ {txn.amount}</td>
                  <td className="py-2 px-4">
                    ₹ {parseFloat(txn.gst).toFixed(2)}
                  </td>
                  <td className="py-2 px-4">₹ {txn.total_amount}</td>
                  <td className="py-2 px-4">{txn.date_time}</td>
                  <td className="py-2 px-4">{txn.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <MdOutlineInbox className="text-gray-400" size={64} />
                    <p className="mt-3 text-sm">No transactions available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card View (for small screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden mt-2">
        {transactions.length > 0 ? (
          transactions.map((txn, idx) => (
            <div
              key={txn.transaction_id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500">#{idx + 1}</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    txn.status === "Success"
                      ? "bg-green-100 text-green-600"
                      : txn.status === "Pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {txn.status}
                </span>
              </div>

              <p className="text-sm">
                <span className="font-semibold text-gray-700">Txn ID:</span>{" "}
                {txn.transaction_id}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Customer:</span>{" "}
                {txn.customer_name}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Amount:</span> ₹{" "}
                {txn.amount}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">GST:</span> ₹{" "}
                {parseFloat(txn.gst).toFixed(2)}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Total:</span> ₹{" "}
                {txn.total_amount}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Date:</span>{" "}
                {txn.date_time}
              </p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <MdOutlineInbox className="text-gray-400" size={64} />
            <p className="mt-3 text-sm text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsUI;

import React, { useEffect, useState } from "react";
import { MdOutlineInbox } from "react-icons/md";
import axios from "axios";

const TransactionsUI = () => {
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost/whatsapp_admin/add_transaction.php");
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
    <div className="bg-white p-4 shadow rounded">
      {/* Table for medium & large screens */}
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
                  className={`py-3 px-4 text-xs md:text-sm text-gray-600 font-medium text-left whitespace-nowrap ${
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
                  className="text-gray-700 hover:bg-gray-50"
                >
                  <td className="py-2 px-4 whitespace-nowrap">{idx + 1}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{txn.transaction_id}</td>
                  <td className="py-2 px-4">{txn.customer_name}</td>
                  <td className="py-2 px-4 whitespace-nowrap">₹ {txn.amount}</td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    ₹ {parseFloat(txn.gst).toFixed(2)}
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">₹ {txn.total_amount}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{txn.date_time}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{txn.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <MdOutlineInbox className="text-gray-400" size={72} />
                    <p className="mt-4 text-sm">No data</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view for small screens */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {transactions.length > 0 ? (
          transactions.map((txn, idx) => (
            <div
              key={txn.transaction_id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <p className="text-xs text-gray-500 mb-2">S.No. {idx + 1}</p>
              <p className="text-sm">
                <span className="font-semibold">Transaction ID: </span>
                {txn.transaction_id}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Customer: </span>
                {txn.customer_name}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Amount: </span>₹ {txn.amount}
              </p>
              <p className="text-sm">
                <span className="font-semibold">GST: </span>₹{" "}
                {parseFloat(txn.gst).toFixed(2)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Total: </span>₹{" "}
                {txn.total_amount}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date: </span>
                {txn.date_time}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Status: </span>
                {txn.status}
              </p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <MdOutlineInbox className="text-gray-400" size={72} />
            <p className="mt-4 text-sm text-gray-500">No data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsUI;

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
      <table className="w-full border-collapse">
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
                className={`py-3 px-4 text-xs text-gray-600 font-medium ${
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
              <tr key={txn.transaction_id} className="text-sm text-gray-700">
                <td className="py-2 px-4">{idx + 1}</td>
                <td className="py-2 px-4">{txn.transaction_id}</td>
                <td className="py-2 px-4">{txn.customer_name}</td>
                <td className="py-2 px-4">₹ {txn.amount}</td>
                <td className="py-2 px-4">₹ {parseFloat(txn.gst).toFixed(2)}</td>
                <td className="py-2 px-4">₹ {txn.total_amount}</td>
                <td className="py-2 px-4">{txn.date_time}</td>
                <td className="py-2 px-4">{txn.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-8 text-gray-500">
                <div className="flex flex-col items-center justify-center h-full">
                  <MdOutlineInbox className="text-gray-400" size={72} />
                  <p className="mt-4">No data</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsUI;

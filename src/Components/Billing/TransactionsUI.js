import { MdOutlineInbox } from "react-icons/md";

const TransactionsUI = ({ transactions }) => {
  return (
    <div className="bg-white p-4 shadow rounded overflow-x-auto">
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
          {transactions && transactions.length > 0 ? (
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
              <td
                colSpan="8"
                className="text-center py-8 text-gray-500"
              >
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
  );
};

export default TransactionsUI;

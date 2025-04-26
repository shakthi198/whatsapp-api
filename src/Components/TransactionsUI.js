import { MdOutlineInbox } from "react-icons/md";

const TransactionsUI = () => {
  return (
    <div className="bg-white p-4 shadow rounded">
      <table className="w-full border-collapse ">
        <thead>
          <tr className="bg-gray-100 ">
            {[
              "S.No.", "Balance", "Amount Paid", "GST", "Gateway",
              "Date & Time", "Method", "Recharge Amount", 
              "Amount Deducted", "Reason", "Status", "Invoice"
            ].map((header, index, arr) => ( // Added `index` and `arr` parameters
              <th
                key={header} // Use `header` as the key
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
            {/* No Data State */}
            <tr>
            <td colSpan="12" className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center justify-center h-full">
                <MdOutlineInbox className="text-gray-400" size={72} />
                <p className="mt-4">No data</p>
              </div>
            </td>
            </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsUI;
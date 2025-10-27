import React from "react";
import { FiInbox } from "react-icons/fi";

const ReusableTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        {/* Table Header */}
        <thead className="bg-gray-200" style={{ fontFamily: "Montserrat" }}>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-6 text-left text-gray-700 text-gray-600 font-medium"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white" style={{ fontFamily: "Montserrat" }}>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-2 text-gray-600 text-gray-600 font-medium"
                  >
                    {row[col] || "-"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-400 py-10"
              >
                <div className="flex flex-col items-center justify-center">
                  <FiInbox size={50} />
                  <span className="text-lg font-semibold">
                    No data available
                  </span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;
import React from "react";
import { ChevronDown } from "lucide-react";

const ChatAgentPage = () => {
  return (
    <div
      className="max-w-7xl mx-auto p-4 sm:p-6"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-medium">Chat Agents</h1>
        <div className="flex flex-wrap items-center text-gray-500 text-xs sm:text-sm">
          <span className="mr-2">|</span>
          <span className="text-yellow-600">Home</span>
          <span className="mx-2">›</span>
          <span className="text-yellow-600 font-medium">Chat Agents</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex overflow-x-auto mb-4 border-b border-gray-200">
        {["All Agents"].map((tab) => (
          <button
            key={tab}
            className={`px-4 sm:px-6 py-3 sm:py-5 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              tab === "All Agents"
                ? "border-yellow-600 text-yellow-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content Container */}
      <div className="bg-white shadow-md rounded-lg border border-gray-300 mt-2">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-medium">Agent List</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              All active chat agents in the system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Add Button */}
            <button className="flex items-center justify-center bg-yellow-600 text-white px-3 sm:px-4 py-2 text-sm rounded-md hover:bg-yellow-700 transition-colors">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Agent
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "ID",
                  "Agent",
                  "Contact",
                  "Role",
                  "Status",
                  "Last Active",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      header === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample Row */}
              <tr className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #AG-001
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm sm:text-base">
                        D
                      </span>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        digital
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        superagent
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">cafdgfhg@gmail.com</div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    +1 234-567-890
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    Admin
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  2 minutes ago
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50">
                      ✏️
                    </button>
                    <button className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50">
                      💬
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">10</span> of{" "}
            <span className="font-medium">24</span> results
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAgentPage;

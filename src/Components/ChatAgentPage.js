import React from 'react';

// You should ensure Montserrat font is loaded in your app,
// either in your global CSS or in index.html like:
// <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />

const ChatAgentPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-montserrat" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb + Add Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <nav className="flex" aria-label="Breadcrumb">
  <ol className="inline-flex items-center space-x-1 md:space-x-3">
    <li className="inline-flex items-center">
      <span className="text-2xl font-medium mr-4">Chat Agents</span>
      <span className=" mx-2 text-gray-400">|</span>
      <a
        href="#"
        className="inline-flex items-center mr-2 text-sm font-medium text-yellow-600 "
      >
        Home
      </a>
    </li>
    <li aria-current="page">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-1 text-sm font-medium text-yellow-600 md:ml-2">
          Chat Agents
        </span>
      </div>
    </li>
  </ol>
</nav>

          <button className="flex items-center justify-center  text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm whitespace-nowrap">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

        {/* Agent Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Agent List</h2>
              <p className="text-sm text-gray-500 mt-1">
                All active chat agents in the system
              </p>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search agents..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Agent', 'Contact', 'Role', 'Status', 'Last Active', 'Actions'].map(
                    (col, i) => (
                      <th
                        key={i}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          col === 'Actions' ? 'text-right' : ''
                        }`}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    #AG-001
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">D</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">digital</div>
                        <div className="text-sm text-gray-500">superagent</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 break-all">cafdgfhg@gmail.com</div>
                    <div className="text-sm text-gray-500">+1 234-567-890</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">2 minutes ago</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                        aria-label="Edit Agent"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition"
                        aria-label="View Agent"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                        aria-label="Delete Agent"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-500 mb-2 md:mb-0">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">10</span> of{' '}
              <span className="font-medium">24</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAgentPage;

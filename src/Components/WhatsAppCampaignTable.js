import React, { useState, useEffect } from "react";
import { FaCheck, FaEye, FaInfoCircle, FaChevronRight } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import { TbArrowBack } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import phone from "../assets/phone.png";
import Pagination from "../Dynamic Components/Pagination";

const WhatsAppCampaignTable = () => {
  const navigate = useNavigate();

  const columns = [
    "S.No",
    "Mobile Number",
    "Failed",
    "Sent",
    "Delivered",
    "Read",
    "Replied",
    "Publish Date",
    "Reason",
    "Actions",
  ];

  const initialData = [
    { id: 1, number: "916380951390", failed: false, sent: true, delivered: true, read: false, replied: false, date: "12/12/2024 06:29 PM", reason: "", action: "view" },
    { id: 2, number: "916080951390", failed: false, sent: true, delivered: false, read: false, replied: false, date: "12/12/2024 06:28 PM", reason: <FaInfoCircle />, action: "view" },
    { id: 3, number: "916082951390", failed: false, sent: true, delivered: true, read: false, replied: false, date: "12/12/2024 06:28 PM", reason: " ", action: "view" },
    { id: 4, number: "916380951390", failed: false, sent: true, delivered: true, read: false, replied: false, date: "12/12/2024 06:17 PM", reason: "   ", action: "view" },
    { id: 5, number: "916380951390", failed: false, sent: true, delivered: true, read: false, replied: false, date: "12/12/2024 06:15 PM", reason: <FaInfoCircle />, action: "view" },
  ];

  // State to manage search input and filtered data
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(initialData);

  // Handle search and filter data
  useEffect(() => {
    const filtered = initialData.filter((row) =>
      row.number.includes(searchTerm)
    );
    setFilteredData(filtered);
  }, [searchTerm]);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6 shadow-sm rounded-md flex justify-between">
      <div className="w-full">
        {/* Breadcrumb navigation */}
        <div className="flex w-full mb-10">
          <h1 className="text-gray-700 font-semibold text-lg mr-2">API-Logs</h1>
          <span className="text-gray-300 mx-1">|</span>
          <div className="flex items-center text-sm text-gray-400">
            <span className="hover:text-gray-600 cursor-pointer">Home</span>
            <FaChevronRight className="mx-1 text-gray-300 text-xs" />
            <span className="text-orange-400 cursor-pointer">Api-logs</span>
          </div>
        </div>

        {/* Top controls */}
        <div className="flex items-center justify-between bg-gray-100 p-2 mb-4">
          {/* Back button now navigates to /ApiLogoui */}
          <button
            className="bg-[#CBAE7D] text-white flex items-center gap-2 px-4 py-2 rounded"
            onClick={() => navigate("/ApiLogoui")}
          >
            <TbArrowBack size={18} /> Back
          </button>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search Contact"
            className="w-1/2 px-4 py-2 border rounded outline-none "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="bg-[#CBAE7D] text-white flex items-center gap-2 px-4 py-2 rounded">
            <AiOutlineDownload size={18} /> Download Report
          </button>
        </div>

        {/* Data table */}
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100 text-gray-600 font-medium">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="border border-gray-200 px-4 py-2 text-left text-gray-700 text-gray-600 font-medium"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{row.id}</td>
                  <td className="border border-gray-200 px-4 py-2">{row.number}</td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {row.failed ? <FaInfoCircle className="text-red-500" /> : "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {row.sent ? <FaCheck className="text-green-500" /> : "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {row.delivered ? <FaCheck className="text-green-500" /> : "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">{row.read ? "✔️" : "-"}</td>
                  <td className="border border-gray-200 px-4 py-2">{row.replied ? "✔️" : "-"}</td>
                  <td className="border border-gray-200 px-4 py-2">{row.date}</td>
                  <td className="border border-gray-200 px-4 py-2 text-red-500">
                    {row.reason || "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    <FaEye className="text-green-500 cursor-pointer" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phone Mockup */}
      <div className="w-1/4 flex justify-center items-start">
        <img
          src={phone}
          alt="Phone Mockup"
          className="relative top-35 right-25 h-85 shadow-lg rounded-xl"
        />
      </div>
     
      
     

      
    </div>
    

  );
};

export default WhatsAppCampaignTable;
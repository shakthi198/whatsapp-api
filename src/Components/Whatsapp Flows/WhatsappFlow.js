import React, { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { IoMdSearch } from "react-icons/io";
import NewFlow from "../NewFlow";
import { BsThreeDotsVertical } from "react-icons/bs";
import Response from "./Response";
import ModalReplica from "../ModalReplica";
import Popover from "../Popover"

const flowsData = [
  { id: 1, name: "asd", flowId: "680349591016296", status: "DEPRECATED" },
  { id: 2, name: "Test", flowId: "948927660645579", status: "DRAFT" },
  { id: 3, name: "Flow 3", flowId: "123456789012345", status: "PUBLISHED" },
];

const WhatsappFlow = () => {
  const [search, setSearch] = useState("");
  const [isNewFlowOpen, setIsNewFlowOpen] = useState(false);
  const [activePage, setActivePage] = useState("flows");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [flows, setFlows] = useState(flowsData);
  const [popover, setPopover] = useState({ show: false, message: "" });
  const [selectedFlowName, setSelectedFlowName] = useState("");
  const [selectedFlowStatus, setSelectedFlowStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const showPopover = (message) => {
    setPopover({ show: true, message });
    setTimeout(() => setPopover({ show: false, message: "" }), 3000);
  };

  const handlePublish = (id) => {
    setFlows((prevFlows) =>
      prevFlows.map((flow) =>
        flow.id === id ? { ...flow, status: "PUBLISHED" } : flow
      )
    );
    showPopover("Flow has been published successfully!");
    setOpenDropdownId(null);
  };

  const handleDeprecate = (id) => {
    setFlows((prevFlows) =>
      prevFlows.map((flow) =>
        flow.id === id ? { ...flow, status: "DEPRECATED" } : flow
      )
    );
    showPopover("Flow has been deprecated successfully!");
    setOpenDropdownId(null);
  };

  const handleDelete = (id) => {
    setFlows((prevFlows) => prevFlows.filter((flow) => flow.id !== id));
    showPopover("Flow has been deleted successfully!");
    setOpenDropdownId(null);
  };

  const handleCreateFlow = (newFlow) => {
    setFlows((prevFlows) => [...prevFlows, newFlow]);
    showPopover("Flow has been created successfully!");
  };

  const handleRowClick = (flow, e) => {
    if (e.target.tagName === "BUTTON" || e.target.tagName === "A") {
      return;
    }
    setSelectedFlowName(flow.name);
    setSelectedFlowStatus(flow.status);
    setIsModalOpen(true);
  };

  const filteredFlows = flows.filter((flow) =>
    flow.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="font-montserrat">
      {/* Popover */}
      {popover.show && <Popover message={popover.message} onClose={() => setPopover({ show: false, message: "" })} />}

      {activePage === "flows" ? (
      <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Whatsapp Flows</h2>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Whatsapp Flows</span>
          </div>
        </div>
      </div>


          {/* Tabs */}
          <div className="flex border-b border-gray-300 mb-4">
            <button
              className={`py-2 px-4 font-medium cursor-pointer ${
                activePage === "flows"
                  ? "border-b-2 border-yellow-600 text-yellow-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActivePage("flows")}
            >
              Flows
            </button>
            <button
              className={`py-2 px-4 font-medium cursor-pointer ${
                activePage === "responses"
                  ? "border-b-2 border-yellow-600 text-yellow-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActivePage("responses")}
            >
              Responses
            </button>
          </div>

          {/* Controls Section */}
          <div className="bg-white p-4 shadow-md rounded-t-md flex justify-end items-center border-b border-gray-300">
            {/* Search Bar */}
            <div className="relative flex items-center w-[280px] border border-gray-300 rounded-md bg-white mr-4">
              <span className="text-gray-500 text-lg px-3">
                <IoMdSearch />
              </span>
              <input
                type="text"
                placeholder="Search here"
                className="w-full px-2 py-2 text-gray-700 placeholder-gray-400 outline-none bg-transparent font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Create Flow Button */}
            <button
              className="bg-yellow-600 text-white px-5 py-2 rounded-md font-medium shadow-md hover:bg-[#c29a4a] transition cursor-pointer"
              onClick={() => setIsNewFlowOpen(true)}
            >
              + Create Flow
            </button>
            <NewFlow
              isOpen={isNewFlowOpen}
              onClose={() => setIsNewFlowOpen(false)}
              onCreateFlow={handleCreateFlow}
            />
          </div>

          {/* Table Section */}
          <div className="bg-white p-4 rounded-b-md">
            <table className="w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-200 text-gray-700 border border-gray-300 text-left">
                  <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">S.No.</th>
                  <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Flow Name</th>
                  <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Flow ID</th>
                  <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Status</th>
                  <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Responses</th>
                  <th className="p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlows.map((flow, index) => (
                  <tr
                    key={flow.id}
                    className="border border-gray-300 p-4 cursor-pointer hover:bg-gray-100"
                    onClick={(e) => handleRowClick(flow, e)}
                  >
                    <td className="p-3 font-medium">{index + 1}</td>
                    <td className="p-3 font-medium">{flow.name}</td>
                    <td className="p-3 font-medium">{flow.flowId}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          flow.status === "DEPRECATED"
                            ? "bg-red-100 text-red-600"
                            : flow.status === "PUBLISHED"
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {flow.status}
                      </span>
                    </td>
                    <td
                      className="p-2 text-yellow-600 underline underline-offset-2 decoration-yellow-600 cursor-pointer font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePage("responses");
                        setSelectedFlowName(flow.name);
                        setSelectedFlowStatus(flow.status);
                      }}
                    >
                      Show Responses
                    </td>
                    <td className="p-2 relative">
                      {flow.status !== "DEPRECATED" && (
                        <button
                          className="p-2 border border-yellow-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(flow.id);
                          }}
                        >
                          <BsThreeDotsVertical className="text-yellow-600" />
                        </button>
                      )}

                      {openDropdownId === flow.id && (
                        <div className="absolute right-0 mt-2 w-28 bg-white shadow-md rounded-md p-2 border border-gray-200 z-10">
                          {flow.status === "DRAFT" && (
                            <>
                              <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium"
                                onClick={() => handlePublish(flow.id)}
                              >
                                Publish
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium"
                                onClick={() => handleDelete(flow.id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {flow.status === "PUBLISHED" && (
                            <button
                              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium"
                              onClick={() => handleDeprecate(flow.id)}
                            >
                              Deprecate
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 items-center gap-2">
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
              <HiChevronLeft className="text-2xl" />
            </button>
            <button className="border border-yellow-600 px-4 py-2 rounded-md text-black font-medium">
              1
            </button>
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
              <HiChevronRight className="text-2xl" />
            </button>
          </div>
        </div>
      ) : (
        <Response 
          goBack={() => setActivePage("flows")} 
          selectedFlowName={selectedFlowName} 
          selectedFlowStatus={selectedFlowStatus} 
        />
      )}

      {/* Modal */}
      <ModalReplica
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flowName={selectedFlowName}
        flowStatus={selectedFlowStatus}
      />
    </div>
  );
};

export default WhatsappFlow;
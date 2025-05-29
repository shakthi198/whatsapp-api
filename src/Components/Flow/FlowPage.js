import React, { useState, useEffect } from "react";
import ToggleSwitch from '../ToggleSwitch';
import CreateFlowModal from './CreateFlowModal';
import UnsubscribeModal from './UnsubscribeModal';
import EditDropdown from "../EditDropdown";
import FlowTypeModal from "../FlowTypeModal";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const FlowPage = () => {
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isUnsubscribeOpen, setIsUnsubscribeOpen] = useState(false);
  const [isFlowTypeModalOpen, setIsFlowTypeModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Initialize state from localStorage
  const [flowData, setFlowData] = useState(() => {
    const savedData = localStorage.getItem("flowData");
    return savedData ? JSON.parse(savedData) : [
      {
        id: 1,
        name: "Welcome",
        type: "whatsapp",
        status: false,
        default: true,
        keywords: "Hi",
        explanation: "",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("flowData", JSON.stringify(flowData));
  }, [flowData]);

  const toggleStatus = (id) => {
    setFlowData((prevData) =>
      prevData.map((flow) =>
        flow.id === id ? { ...flow, status: !flow.status } : flow
      )
    );
  };

  const toggleDefault = (id) => {
    setFlowData((prevData) =>
      prevData.map((flow) =>
        flow.id === id ? { ...flow, default: !flow.default } : flow
      )
    );
  };

  const addFlow = (newFlow) => {
    setFlowData((prevData) => [...prevData, newFlow]);
  };

  const handleEditField = (id, field, value) => {
    setFlowData((prevData) =>
      prevData.map((flow) =>
        flow.id === id ? { ...flow, [field]: value } : flow
      )
    );
  };

  const deleteFlow = (flowId) => {
    setFlowData((prevData) => prevData.filter((flow) => flow.id !== flowId));
  };

  const handleOpenFlowTypeModal = (id) => {
    setSelectedNodeId(id);
    setIsFlowTypeModalOpen(true);
  };

  const handleSaveKeywords = (value) => {
    if (selectedNodeId) {
      handleEditField(selectedNodeId, "keywords", value);
    }
    setIsFlowTypeModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Flow</h2>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Flow</span>
          </div>
        </div>
      </div>


      {/* Controls Section */}
      <div className="bg-white p-4 shadow-md rounded-t-md flex justify-between items-center">
        <div></div>
        <div className="flex items-center gap-3">
          <label className="text-gray-600 font-medium">Matching Type:</label>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 w-130 font-medium">
            <option className="font-medium">Fuzzy Matching</option>
          </select>

          <button
            className="bg-yellow-600 text-white px-5 py-2 rounded-md font-medium shadow-md cursor-pointer"
            onClick={() => setIsCreateFlowOpen(true)}
          >
            + Create Flow
          </button>
          <CreateFlowModal
            isOpen={isCreateFlowOpen}
            onClose={() => setIsCreateFlowOpen(false)}
            addFlow={addFlow}
          />

          <button
            className="bg-yellow-600 text-white px-5 py-2 rounded-md font-medium shadow-md cursor-pointer"
            onClick={() => setIsUnsubscribeOpen(true)}
          >
            Unsubscribe Keys
          </button>
          <UnsubscribeModal
            isOpen={isUnsubscribeOpen}
            onClose={() => setIsUnsubscribeOpen(false)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-b-md">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700 border border-gray-300 text-left">
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">S.No.</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Flow Name</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Flow Type</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Status of Flow</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Default</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Key Words</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Flow Explanation</th>
              <th className="p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowData.map((flow, index) => (
              <tr key={flow.id} className="border border-gray-300">
                <td className="p-2 font-medium">{index + 1}</td>
                <td className="p-2 font-medium">{flow.name}</td>
                <td className="p-2 font-medium">{flow.type}</td>
                <td className="p-2 text-center">
                  <ToggleSwitch
                    isOn={flow.status}
                    onToggle={() => toggleStatus(flow.id)}
                  />
                </td>
                <td className="p-2 text-center">
                  <ToggleSwitch
                    isOn={flow.default}
                    onToggle={() => toggleDefault(flow.id)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    value={flow.keywords}
                    onClick={() => handleOpenFlowTypeModal(flow.id)}
                    className="border rounded p-1 w-42 h-42 bg-white cursor-pointer font-medium"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    value={flow.explanation}
                    onChange={(e) =>
                      handleEditField(flow.id, "explanation", e.target.value)
                    }
                    className="border rounded p-1 w-42 h-42 bg-white font-medium"
                  />
                </td>
                <td className="p-2 text-center">
                  <EditDropdown flowId={flow.id} onDelete={deleteFlow} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FlowTypeModal
        isOpen={isFlowTypeModalOpen}
        onClose={() => setIsFlowTypeModalOpen(false)}
        onSave={handleSaveKeywords}
      />

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
  );
};

export default FlowPage;
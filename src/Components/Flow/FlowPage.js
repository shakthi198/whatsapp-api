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

  const [flowData, setFlowData] = useState(() => {
    const savedData = localStorage.getItem("flowData");
    return savedData ? JSON.parse(savedData) : [
      { id: 1, name: "Welcome", type: "whatsapp", status: false, default: true, keywords: "Hi", explanation: "" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("flowData", JSON.stringify(flowData));
  }, [flowData]);

  const toggleStatus = (id) => {
    setFlowData(prev => prev.map(flow => flow.id === id ? { ...flow, status: !flow.status } : flow));
  };

  const toggleDefault = (id) => {
    setFlowData(prev => prev.map(flow => flow.id === id ? { ...flow, default: !flow.default } : flow));
  };

  const addFlow = (newFlow) => setFlowData(prev => [...prev, newFlow]);
  const handleEditField = (id, field, value) => setFlowData(prev => prev.map(flow => flow.id === id ? { ...flow, [field]: value } : flow));
  const deleteFlow = (flowId) => setFlowData(prev => prev.filter(flow => flow.id !== flowId));

  const handleOpenFlowTypeModal = (id) => {
    setSelectedNodeId(id);
    setIsFlowTypeModalOpen(true);
  };

  const handleSaveKeywords = (value) => {
    if (selectedNodeId) handleEditField(selectedNodeId, "keywords", value);
    setIsFlowTypeModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-montserrat">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-2 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h2 className="text-xl md:text-2xl font-medium">Flow</h2>
          <div className="flex items-center text-xs md:text-sm text-gray-600 flex-wrap">
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Flow</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-4 shadow-md rounded-t-md flex flex-col md:flex-row md:justify-between gap-3 md:gap-0 items-start md:items-center flex-wrap">
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <label className="text-gray-600 font-medium">Matching Type:</label>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 font-medium w-full md:w-48">
            <option className="font-medium">Fuzzy Matching</option>
          </select>

          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded-md font-medium shadow-md w-full md:w-auto"
            onClick={() => setIsCreateFlowOpen(true)}
          >
            + Create Flow
          </button>
          <CreateFlowModal isOpen={isCreateFlowOpen} onClose={() => setIsCreateFlowOpen(false)} addFlow={addFlow} />

          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded-md font-medium shadow-md w-full md:w-auto"
            onClick={() => setIsUnsubscribeOpen(true)}
          >
            Unsubscribe Keys
          </button>
          <UnsubscribeModal isOpen={isUnsubscribeOpen} onClose={() => setIsUnsubscribeOpen(false)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-b-md overflow-x-auto mt-2">
        <table className="w-full min-w-[700px] border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700 border border-gray-300 text-left text-sm md:text-base">
              <th className="p-2 border-r border-gray-300 font-medium">S.No.</th>
              <th className="p-2 border-r border-gray-300 font-medium">Flow Name</th>
              <th className="p-2 border-r border-gray-300 font-medium">Flow Type</th>
              <th className="p-2 border-r border-gray-300 font-medium text-center">Status of Flow</th>
              <th className="p-2 border-r border-gray-300 font-medium text-center">Default</th>
              <th className="p-2 border-r border-gray-300 font-medium text-center">Key Words</th>
              <th className="p-2 border-r border-gray-300 font-medium text-center">Flow Explanation</th>
              <th className="p-2 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowData.map((flow, index) => (
              <tr key={flow.id} className="border border-gray-300 text-sm md:text-base">
                <td className="p-2 font-medium">{index + 1}</td>
                <td className="p-2 font-medium">{flow.name}</td>
                <td className="p-2 font-medium">{flow.type}</td>
                <td className="p-2 text-center">
                  <ToggleSwitch isOn={flow.status} onToggle={() => toggleStatus(flow.id)} />
                </td>
                <td className="p-2 text-center">
                  <ToggleSwitch isOn={flow.default} onToggle={() => toggleDefault(flow.id)} />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    value={flow.keywords}
                    onClick={() => handleOpenFlowTypeModal(flow.id)}
                    className="border rounded p-1 w-full md:w-32 bg-white cursor-pointer font-medium text-center"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    value={flow.explanation}
                    onChange={(e) => handleEditField(flow.id, "explanation", e.target.value)}
                    className="border rounded p-1 w-full md:w-32 bg-white font-medium"
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

      <FlowTypeModal isOpen={isFlowTypeModalOpen} onClose={() => setIsFlowTypeModalOpen(false)} onSave={handleSaveKeywords} />

      {/* Pagination */}
      <div className="flex justify-end mt-4 items-center gap-2 flex-wrap">
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

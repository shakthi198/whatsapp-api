import React, { useState,useEffect } from "react";
import ToggleSwitch from '../Components/ToggleSwitch';
import CreateFlowModal from '../Components/CreateFlowModal';
import UnsubscribeModal from '../Components/UnsubscribeModal';
import EditDropdown from "../Components/EditDropdown";
import FlowTypeModal from "../Components/FlowTypeModal"; // Import the FlowTypeModal
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const FlowPage = () => {
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isUnsubscribeOpen, setIsUnsubscribeOpen] = useState(false);
  const [isFlowTypeModalOpen, setIsFlowTypeModalOpen] = useState(false); // State for FlowTypeModal
  const [selectedNodeId, setSelectedNodeId] = useState(null); // Track the selected node ID

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

  // Save data to localStorage whenever flowData changes
  useEffect(() => {
    localStorage.setItem("flowData", JSON.stringify(flowData));
  }, [flowData]);


  // Toggle flow status
  const toggleStatus = (id) => {
    setFlowData((prevData) =>
      prevData.map((flow) =>
        flow.id === id ? { ...flow, status: !flow.status } : flow
      )
    );
  };

  // Toggle default status
  const toggleDefault = (id) => {
    setFlowData((prevData) =>
      prevData.map((flow) =>
        flow.id === id ? { ...flow, default: !flow.default } : flow
      )
    );
  };

  // Add new flow to the table
  const addFlow = (newFlow) => {
    setFlowData((prevData) => [...prevData, newFlow]);
  };

  // Handle editing of keywords and explanation
  const handleEditField = (id, field, value) => {
    setFlowData((prevData) =>
      prevData.map((flow) =>
        flow.id === id ? { ...flow, [field]: value } : flow
      )
    );
  };

   // Handle deleting a flow
   const deleteFlow = (flowId) => {
    setFlowData((prevData) => prevData.filter((flow) => flow.id !== flowId));
  };

  // Handle opening the FlowTypeModal
  const handleOpenFlowTypeModal = (id) => {
    setSelectedNodeId(id); // Set the selected node ID
    setIsFlowTypeModalOpen(true); // Open the modal
  };

  // Handle saving the keywords from the modal
  const handleSaveKeywords = (value) => {
    if (selectedNodeId) {
      handleEditField(selectedNodeId, "keywords", value); // Update the keywords for the selected node
    }
    setIsFlowTypeModalOpen(false); // Close the modal
  };

  

  return (
    <div className="min-h-screen p-6">
      {/* Page Header with Line */}
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-medium ">Flow</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-yellow-600 text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-yellow-600">Flow</span>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-4 shadow-md rounded-t-md flex justify-between items-center">
        {/* Left Empty Space for Alignment */}
        <div></div>

        {/* Action Buttons with Matching Type */}
        <div className="flex items-center gap-3">
          <label className="text-gray-600 font-medium">Matching Type:</label>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 w-130">
            <option>Fuzzy Matching</option>
          </select>

          <button
            className="bg-yellow-600 text-white px-5 py-2 rounded-md font-medium shadow-md cursor-pointer"
            onClick={() => setIsCreateFlowOpen(true)}
          >
            + Create Flow
          </button>
          {/* Create Flow Modal */}
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
          {/* Unsubscribe Modal */}
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
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowData.map((flow, index) => (
              <tr key={flow.id} className="border border-gray-300">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{flow.name}</td>
                <td className="p-2">{flow.type}</td>
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
                {/* Editable Keywords Field */}
                <td className="p-2 text-center">
                  <input
                    type="text"
                    value={flow.keywords}
                    onClick={() => handleOpenFlowTypeModal(flow.id)} // Open modal on click
                    className="border rounded p-1 w-42 h-42 bg-white cursor-pointer"
                    readOnly // Make the input read-only
                  />
                </td>
               {/* Editable Explanation Field */}
               <td className="p-2 text-center">
                  <input
                    type="text"
                    value={flow.explanation}
                    onChange={(e) =>
                      handleEditField(flow.id, "explanation", e.target.value)
                    }
                    className="border rounded p-1 w-42 h-42 bg-white"
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

       {/* FlowTypeModal */}
       <FlowTypeModal
        isOpen={isFlowTypeModalOpen}
        onClose={() => setIsFlowTypeModalOpen(false)}
        onSave={handleSaveKeywords} // Pass the save handler
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
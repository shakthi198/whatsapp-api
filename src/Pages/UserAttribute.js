import React, { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import CreateAttributeModal from "../Components/CreateAttributeModal";
import EditAttributeModal from "../Components/EditAttributeModal"; // Import the EditAttributeModal

const UserAttribute = () => {
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isEditFlowOpen, setIsEditFlowOpen] = useState(false);
  const [flowData, setFlowData] = useState([
    {
      id: 1,
      name: "$ASDFG",
      value: "$QWERTY",
    },
  ]);
  const [selectedRow, setSelectedRow] = useState(null); // Track the row being edited

  const [selectedValue, setSelectedValue] = useState(10);

  // Array of page size options
  const pageSizes = [10, 20, 30, 50, 100];

  // Function to handle creating a new attribute
  const handleCreateAttribute = (newAttribute) => {
    setFlowData([...flowData, { ...newAttribute, id: flowData.length + 1 }]);
  };

  // Function to handle deleting a row
  const handleDelete = (id) => {
    const updatedData = flowData.filter((flow) => flow.id !== id);
    setFlowData(updatedData);
  };

  // Function to handle editing a row
  const handleEdit = (row) => {
    setSelectedRow(row); // Set the row to be edited
    setIsEditFlowOpen(true); // Open the edit modal
  };

  // Function to handle updating a row
  const handleUpdateAttribute = (updatedAttribute) => {
    const updatedData = flowData.map((flow) =>
      flow.id === updatedAttribute.id ? updatedAttribute : flow
    );
    setFlowData(updatedData);
    setIsEditFlowOpen(false); // Close the edit modal
  };

  return (
    <div className=" p-6">
      {/* Page Header with Line */}
      <div className="flex items-center mb-4">
        <h2 className="text-3xl font-semibold text-gray-700">Manage User Attributes</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">Manage User Attributes</span>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-4 shadow-md rounded-t-md flex justify-between items-center">
        <div></div>
        <div className="flex items-center gap-3">
          <button
            className="bg-[#DDA853] text-white px-5 py-2 rounded-md font-medium shadow-md cursor-pointer"
            onClick={() => setIsCreateFlowOpen(true)}
          >
            + Create User Attribute
          </button>
          <CreateAttributeModal
            isOpen={isCreateFlowOpen}
            onClose={() => setIsCreateFlowOpen(false)}
            onCreateAttribute={handleCreateAttribute}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-4 rounded-b-md">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700 border border-gray-300 text-left">
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">S.No.</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Name</th>
              <th className="p-2 border-r border-gray-300 text-gray-600 font-medium">Value</th>
              <th className="p-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowData.map((flow, index) => (
              <tr key={flow.id} className="border border-gray-300">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{flow.name}</td>
                <td className="p-2">{flow.value}</td>
                <td className="p-2 text-left space-x-3">
                  <button
                    className="border border-[#DDA853] text-white p-3 rounded-md cursor-pointer"
                    onClick={() => handleEdit(flow)} // Add onClick handler for edit
                  >
                    <FaEdit className="text-xl text-[#DDA853]" strokeWidth={2.5} />
                  </button>
                  <button
                    className="border border-[#DDA853] text-white p-3 rounded-md cursor-pointer"
                    onClick={() => handleDelete(flow.id)} // Add onClick handler for delete
                  >
                    <MdOutlineDelete className="text-xl text-[#DDA853]" />
                  </button>
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
        <button className="border border-[#DDA853] px-4 py-2 rounded-md text-black font-medium">
          1
        </button>
        <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
          <HiChevronRight className="text-2xl" />
        </button>

        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(Number(e.target.value))}
          className="border border-gray-300 bg-gray-100 px-3 py-2 rounded-md text-gray-700 mr-5"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size} / Page
            </option>
          ))}
        </select>
      </div>

      {/* Edit Attribute Modal */}
      <EditAttributeModal
        isOpen={isEditFlowOpen}
        onClose={() => setIsEditFlowOpen(false)}
        rowData={selectedRow} // Pass the selected row data to the modal
        onUpdateAttribute={handleUpdateAttribute} // Pass the update function
      />
    </div>
  );
};

export default UserAttribute;
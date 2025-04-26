import { useState } from "react";

export default function AttributeModal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [attributes, setAttributes] = useState([]);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const openAddModal = () => {
    setIsAddModalOpen(true);
    setIsSelectModalOpen(false);
  };

  const openSelectModal = () => {
    setIsSelectModalOpen(true);
    setIsAddModalOpen(false);
  };

  const handleAddAttribute = () => {
    if (name && value) {
      setAttributes([...attributes, { name, value }]);
      setName("");
      setValue("");
      openSelectModal();
    }
  };

  const handleDelete = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={openAddModal}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Open Add Attribute
      </button>

      {/* Add Attribute Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add User Attribute</h2>
              <button onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter Attribute Name"
                className="w-full px-3 py-2 border rounded mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label className="block text-sm font-medium mt-3">Value</label>
              <input
                type="text"
                placeholder="Enter Attribute Value"
                className="w-full px-3 py-2 border rounded mt-1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAttribute}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Attribute Modal */}
      {isSelectModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Attribute</h2>
              <button onClick={() => setIsSelectModalOpen(false)}>×</button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Search attributes..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <button
              onClick={openAddModal}
              className="mt-4 w-full flex items-center justify-center bg-yellow-500 text-white px-4 py-2 rounded"
            >
              + Add Attribute
            </button>

            <div className="mt-4">
              {attributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-500 text-white px-3 py-2 rounded-full mt-2"
                >
                  <span>{attr.name}</span>
                  <button onClick={() => handleDelete(index)} className="ml-2">
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <button className="px-2 py-1 border rounded">&lt;</button>
              <span>1</span>
              <button className="px-2 py-1 border rounded">&gt;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
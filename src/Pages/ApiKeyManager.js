import React, { useState } from 'react';
import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "../Dynamic Components/ApiPagination";

const ApiKeyManager = () => {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Test API', createdAt: '05-12-2024, 4:09 PM', key: '226b3bc6338f9de4107cc93...' },
    // Add more keys here to test pagination
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
 
  // Calculate total pages
  const totalPages = Math.ceil(keys.length / itemsPerPage);

  // Get current keys for the current page
  const indexOfLastKey = currentPage * itemsPerPage;
  const indexOfFirstKey = indexOfLastKey - itemsPerPage;
  const currentKeys = keys.slice(indexOfFirstKey, indexOfLastKey);

  const openModal = (key = null) => {
    setCurrentKey(key);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentKey(null);
  };

  const generateRandomKey = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleSave = (keyData) => {
    const newKeyData = {
      ...keyData,
      createdAt: new Date().toLocaleString(),
      key: generateRandomKey(),
    };

    if (keyData.id) {
      setKeys(keys.map(k => k.id === keyData.id ? newKeyData : k));
    } else {
      setKeys([...keys, { ...newKeyData, id: keys.length + 1 }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setKeys(keys.filter(key => key.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex space-x-6 text-gray-600 font-medium">
        <span className="border-b-2 border-yellow-500 pb-2">Manage API Keys</span>
        <span className="hover:border-b-2 hover:border-yellow-500 pb-2 cursor-pointer">Webhook Message Configurations</span>
        <span className="hover:border-b-2 hover:border-yellow-500 pb-2 cursor-pointer">Webhook Report Configurations</span>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 mt-5">
        <div className="flex justify-end items-center mb-4 border-b pb-4">
          <button onClick={() => openModal()} className="bg-[#D4BA85] text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600">
            + Create New Api Key
          </button>
        </div>
        <table className="min-w-full bg-white border border-gray-100 rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-gray-600 font-medium">NAME</th>
              <th className="py-3 px-4 text-left text-gray-600 font-medium">CREATED AT</th>
              <th className="py-3 px-4 text-left text-gray-600 font-medium">KEY</th>
              <th className="py-3 px-4 text-left text-gray-600 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentKeys.map((key) => (
              <tr key={key.id} className="border-t">
                <td className="py-3 px-4 text-gray-700">{key.name}</td>
                <td className="py-3 px-4 text-gray-700">{key.createdAt}</td>
                <td className="py-3 px-4 text-gray-700">{key.key}</td>
                <td className="py-3 px-4 flex space-x-2">
                  <button className="bg-white p-2 rounded-md border rounded-lg border-[#D4BA85]" onClick={() => openModal(key)}>
                    <FaEdit className="text-[#D4BA85]" />
                  </button>
                  <button className="bg-white p-2 ml-2 border rounded-lg border-[#D4BA85] rounded-md" onClick={() => handleDelete(key.id)}>
                    <FaTrash className="text-[#D4BA85]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {keys.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      )}

      {isModalOpen && (
        <Modal keyData={currentKey} onClose={closeModal} onSave={handleSave} />
      )}
    </div>
  );
};

const Modal = ({ keyData, onClose, onSave }) => {
  const [name, setName] = useState(keyData?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: keyData?.id, name });
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center transition-opacity duration-300">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">{keyData ? 'Edit API Key' : 'Add API Key'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#D4BA85] text-white rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyManager;
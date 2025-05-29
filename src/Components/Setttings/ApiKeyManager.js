import React, { useState } from 'react';
import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "../../Dynamic Components/ApiPagination";

const ApiKeyManager = () => {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Test API', createdAt: '05-12-2024, 4:09 PM', key: '226b3bc6338f9de4107cc93...' },
    // Add more keys here to test pagination
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(keys.length / itemsPerPage);
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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${result.substring(0, 8)}-${result.substring(8, 16)}-${result.substring(16, 24)}-${result.substring(24)}`;
  };

  const handleSave = (keyData) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getFullYear()}, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    
    const newKeyData = {
      ...keyData,
      createdAt: formattedDate,
      key: keyData.id ? keyData.key : `${generateRandomKey()}...`,
    };

    if (keyData.id) {
      setKeys(keys.map(k => k.id === keyData.id ? newKeyData : k));
    } else {
      setKeys([...keys, { ...newKeyData, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      setKeys(keys.filter(key => key.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
            <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">API Key Manager</h2>
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <span className="mr-2 hidden md:inline">|</span>
              <span className="text-yellow-600">Home</span>
              <span className="mx-1 md:mx-2">›</span>
              <span className="text-yellow-600">API Keys</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-yellow-500 text-yellow-600">
            Manage API Keys
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-yellow-600">
            Webhook Message Configurations
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-yellow-600">
            Webhook Report Configurations
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium text-gray-700">API Keys</h3>
            <button 
              onClick={() => openModal()} 
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              + Create New API Key
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentKeys.length > 0 ? (
                  currentKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{key.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{key.createdAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{key.key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openModal(key)}
                            className="text-yellow-600 hover:text-yellow-800 p-1 rounded-md hover:bg-yellow-50"
                            aria-label="Edit"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(key.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No API keys found. Create your first API key.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {keys.length > itemsPerPage && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                setCurrentPage={setCurrentPage} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
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
    onSave({ ...keyData, name });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {keyData ? 'Edit API Key' : 'Create New API Key'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Enter API key name"
                  required
                />
              </div>
              {keyData && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="p-2 bg-gray-100 rounded-md font-mono text-sm">
                    {keyData.key}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Note: This is a sensitive credential. Keep it secure.
                  </p>
                </div>
              )}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:col-start-2 sm:text-sm"
                >
                  {keyData ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
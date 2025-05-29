import { useState, useRef } from "react";
import { FiDownload } from "react-icons/fi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddTagModal from '../AddTagModal';

const ContactsUI = () => {
  const [selectedValue, setSelectedValue] = useState(10);
  const [contacts, setContacts] = useState([
    {
      id: 1,
      lastMessageTime: "19/02/2025, 05:14:35 pm",
      name: "💫",
      lastMessage: "hi",
      tags: ["fdghj"],
      mobile: "919865230181",
    },
    {
      id: 2,
      lastMessageTime: "30/11/2024, 03:02:00 pm",
      name: "Vicky[SolveInnovative] 🤝💪",
      lastMessage: "Welcome to Our T...",
      tags: ["hello", "hi", "sdfghj"],
      mobile: "919786742563",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const addTagButtonRef = useRef(null);

  const pageSizes = [10, 20, 30, 50, 100];

  const handleAddTag = (contactId, newTag) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, tags: [...contact.tags, newTag] }
          : contact
      )
    );
    toast.success(`Tag added successfully!`);
  };

  const handleDeleteTag = (contactId, tagToDelete) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId
          ? { ...contact, tags: contact.tags.filter(tag => tag !== tagToDelete) }
          : contact
      )
    );
    toast.error(`Tag removed successfully!`);
  };

  const openModal = (contactId, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setButtonPosition({
      top: buttonRect.top + window.scrollY - 20,
      left: buttonRect.left + window.scrollX + buttonRect.width / 2,
    });
    setSelectedContactId(contactId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContactId(null);
  };

  const filteredContacts = contacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.mobile.includes(searchQuery) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-montserrat">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Add Tag Modal */}
      {isModalOpen && (
        <AddTagModal
          onClose={closeModal}
          onAdd={(newTag) => {
            if (selectedContactId) {
              handleAddTag(selectedContactId, newTag);
            }
            closeModal();
          }}
          position={buttonPosition}
        />
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
            <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Contacts</h2>
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <span className="mr-2 hidden md:inline">|</span>
              <span className="text-yellow-600">Home</span>
              <span className="mx-1 md:mx-2">›</span>
              <span className="text-yellow-600">Contacts</span>
            </div>
          </div>
        </div>

        {/* Search and Download Section */}
        <div className="">
          <input
            type="text"
            placeholder="Search tag / name / number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 text-gray-500 px-4 py-2 text-sm rounded-md w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
          <button 
            className="flex items-center gap-2 text-gray-600 p-2 hover:bg-gray-100 rounded-md"
            onClick={() => toast.info("Download functionality will be implemented")}
          >
            <FiDownload size={20} />
            <span className="hidden md:inline">Download</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-b-md w-full overflow-x-auto shadow-md">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="pl-4 pr-2 py-3 text-left font-medium whitespace-nowrap">S.No.</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Last Message Time</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Name</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Last Message</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Tags</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Mobile number</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 transition-all border-t border-gray-200"
                  >
                    <td className="pl-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{contact.lastMessageTime}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{contact.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{contact.lastMessage}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 items-start">
                        {contact.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center border border-gray-300 text-green-600 px-2 py-1 rounded text-xs hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleDeleteTag(contact.id, tag)}
                          >
                            {tag}
                          </span>
                        ))}
                        <button
                          ref={addTagButtonRef}
                          className="text-xs text-gray-800 border border-dashed border-gray-400 px-2 py-1 rounded hover:bg-gray-100"
                          onClick={(e) => openModal(contact.id, e)}
                        >
                          + Add Tag
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{contact.mobile}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No contacts found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4 bg-white shadow-md rounded-b-md px-4">
          <div className="text-sm text-gray-600">
            Showing 1 to {filteredContacts.length} of {contacts.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-200">
              <HiChevronLeft className="text-xl" />
            </button>
            <button className="border border-yellow-600 px-3 py-1 rounded-md text-black font-medium">
              1
            </button>
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-200">
              <HiChevronRight className="text-xl" />
            </button>

            <select
              value={selectedValue}
              onChange={(e) => setSelectedValue(Number(e.target.value))}
              className="border border-gray-300 bg-white px-2 py-1 text-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size} / Page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsUI;
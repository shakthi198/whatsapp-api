import { useState, useRef } from "react";
import { FiDownload } from "react-icons/fi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddTagModal from '../Components/AddTagModal'; // Import the modal component

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
        top: buttonRect.top + window.scrollY - 20, // Move modal 150px above
        left: buttonRect.left + window.scrollX + buttonRect.width / 2, // Center the modal
    });
    setSelectedContactId(contactId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContactId(null);
  };
// Filter contacts based on search query
const filteredContacts = contacts.filter((contact) => {
    // Check name, mobile, and tags for matching query
    return (
      contact.name.toLowerCase().includes(searchQuery) ||
      contact.mobile.includes(searchQuery) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
    );
  });
  
  return (
    <div className="p-4">
      <ToastContainer />
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

      {/* Page Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-3xl font-medium text-gray-700">UI-Contacts</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">UI-contacts</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-t-md shadow-md flex items-center justify-between w-full">
        <input
          type="text"
          placeholder="Search tag / name / number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          className="border border-gray-300 text-gray-500 px-4 py-2 text-sm rounded-md w-1/5 focus:outline-none focus:border-[#DDA853]"
        />
        <button className="text-gray-600 p-2  hover:bg-gray-100">
          <FiDownload size={22} />
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-md w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-gray-800 border-t border-gray-300">
            <tr>
              <th className="pl-3 pr-10 py-4 text-left font-medium">S.No.</th>
              <th className="px-6 py-4 whitespace-pre-line font-medium">Last Message Time</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Last Message</th>
              <th className="px-6 py-4 font-medium">Tags</th>
              <th className="px-6 py-4 font-medium">Mobile number</th>
            </tr>
          </thead>
          <tbody>
          {filteredContacts.map((contact, index) => (
              <tr
                key={contact.id}
                className={`hover:bg-gray-50 transition-all cursor-pointer ${
                  index === 1 ? "border-b border-t border-gray-300" : "border-t border-gray-300"
                }`}
              >
                <td className="p-3">{index + 1}</td>
                <td className="px-6 py-4 whitespace-pre-line">{contact.lastMessageTime}</td>
                <td className="px-6 py-4">{contact.name}</td>
                <td className="px-6 py-4">{contact.lastMessage}</td>
                <td className="px-6 py-4 flex flex-col gap-2 items-start">
                  {contact.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="border border-gray-300 text-green-600 px-2 py-1 rounded text-sm hover:cursor-pointer"
                      onClick={() => handleDeleteTag(contact.id, tag)}
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    ref={addTagButtonRef}
                    className="text-sm text-gray-800 border border-dashed border-gray-400 px-2 py-1 rounded hover:cursor-pointer"
                    onClick={(e) => openModal(contact.id, e)}
                  >
                    + Add Tag
                  </button>
                </td>
                <td className="px-6 py-4">{contact.mobile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end py-4 items-center gap-2 bg-white shadow-md rounded-b-md">
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
          className="border border-gray-300 bg-gray-100 px-2  text-gray-700 mr-5"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size} / Page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ContactsUI;
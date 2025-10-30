import { HiChevronRight,HiChevronLeft } from "react-icons/hi";
import { LuUsers, LuSquarePlus } from "react-icons/lu";
import { MdOutlineInbox } from "react-icons/md";
import { TbDownload, TbUpload } from "react-icons/tb";
import { RiDeleteBinLine } from "react-icons/ri";
import AddContactModal from "../AddContactModal";
import ImportContactModal from "../ImportContactModal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from 'file-saver';
import apiEndpoints from "../../apiconfig";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      const response = await axios.get(apiEndpoints.addContact);
      let data = response.data;
      if (data && typeof data === "object" && data.data) data = data.data;
      if (!Array.isArray(data)) data = [];
      setContacts(data);
      setFilteredContacts(data); // Initialize filtered contacts with all data
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
      setFilteredContacts([]);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.contact_group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.mobile_number?.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await axios.delete(apiEndpoints.addContact, { data: { id } });
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return alert("Select at least one contact.");
    if (!window.confirm(`Delete ${selectedContacts.length} contacts?`)) return;
    try {
      await axios.delete(apiEndpoints.addContact, { data: { ids: selectedContacts } });
      setSelectedContacts([]);
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contacts:", error);
    }
  };

  const handleImport = async (importedContacts) => {
    try {
      const response = await axios.post(apiEndpoints.addContact, {
        action: "import",
        contacts: importedContacts
      });
      if (response.data.status) {
        fetchContacts();
        setIsImportModalOpen(false);
      }
    } catch (error) {
      console.error("Error importing contacts:", error);
    }
  };

  const handleExport = () => {
    const headers = ["Contact Name", "Group Name", "Tags", "Mobile Number"];
    const csvContent = [
      headers.join(","),
      ...filteredContacts.map(c => `"${c.contact_name}","${c.contact_group}","${c.tags}","${c.mobile_number}"`)
    ].join("\n");
    saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8" }), "contacts_export.csv");
  };

  const handleSampleCSV = () => {
    const sampleData = [
      ["Contact Name", "Group Name", "Tags", "Mobile Number"],
      ["John Doe", "Friends", "close-friend", "+1234567890"],
      ["Jane Smith", "Work", "colleague", "+1987654321"]
    ].join("\n");
    saveAs(new Blob([sampleData], { type: "text/csv;charset=utf-8" }), "contacts_sample.csv");
  };

  const toggleSelectAll = (e) => {
    setSelectedContacts(e.target.checked ? filteredContacts.map(c => c.id) : []);
  };

  const toggleSelectContact = (id, checked) => {
    setSelectedContacts(checked ? [...selectedContacts, id] : selectedContacts.filter(i => i !== id));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="width-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center mb-4 gap-2">
        <h2 className="text-3xl font-semibold text-gray-700 whitespace-wrap">
          Contacts
        </h2>
        <div className="flex items-center flex-nowrap text-yellow-600 text-md gap-1">
          <div className="flex items-center text-lg text-gray-600 flex-wrap gap-1">
            <span className="hidden md:inline">|</span>
          </div>
          <span className="whitespace-nowrap">Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="whitespace-nowrap">Contacts</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-t-md flex flex-col md:flex-row md:items-center md:justify-between shadow-md gap-3 md:gap-0">
        <div className="flex flex-col lg:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full lg:w-32 focus:outline-none focus:border-yellow-600"
          >
            <option value="All">All</option>
          </select>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name, group, tag, or number"
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:border-yellow-600 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <hr />

      {/* Action Buttons */}
      <div className="bg-white rounded-b-md p-4 flex flex-wrap items-center justify-start space-x-2 gap-y-2 md:gap-y-0">
        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setEditingContact(null);
          }}
          className="text-gray-600 text-2xl"
          title="Add Contact"
        >
          <LuSquarePlus />
        </button>
        <button
          onClick={handleBulkDelete}
          className="px-4 py-2 text-gray-600 text-2xl"
          title="Delete Selected"
        >
          <RiDeleteBinLine />
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-3 py-2 text-gray-600 text-2xl"
          title="Import Contacts"
        >
          <TbUpload />
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-2 text-gray-600 text-2xl"
          title="Export Contacts"
        >
          <TbDownload />
        </button>
        <button
          onClick={() => navigate("/manage-groups")}
          className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center whitespace-nowrap"
        >
          <LuUsers className="mr-2" /> Manage Groups
        </button>
        <button
          onClick={handleSampleCSV}
          className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center whitespace-nowrap"
        >
          <TbDownload className="mr-2" /> Sample CSV
        </button>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mt-3 bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">
            Showing {filteredContacts.length} result{filteredContacts.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
            <button
              onClick={clearSearch}
              className="ml-2 text-blue-500 hover:text-blue-700 underline text-xs"
            >
              Clear search
            </button>
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-4 rounded-md overflow-x-auto shadow mt-3">
        <table className="w-full text-sm overflowX-auto">
          <thead className="bg-gray-100 text-left font-semibold text-gray-800">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={
                    selectedContacts.length === filteredContacts.length &&
                    filteredContacts.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2">S.No.</th>
              <th className="px-4 py-2">Contact Name</th>
              <th className="px-4 py-2">Group Name</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Mobile Number</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  <MdOutlineInbox
                    className="mx-auto text-gray-400 mt-6"
                    size={72}
                  />
                  <p>
                    {searchQuery ? "No contacts found matching your search" : "No contacts available"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="mt-2 text-yellow-600 hover:text-yellow-700 underline"
                    >
                      Clear search
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact, i) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) =>
                        toggleSelectContact(contact.id, e.target.checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{contact.contact_name}</td>
                  <td className="px-4 py-2">{contact.contact_group}</td>
                  <td className="px-4 py-2">{contact.tags}</td>
                  <td className="px-4 py-2">{contact.mobile_number}</td>
                  <td className="px-4 py-2 flex space-x-2 flex-wrap">
                    <button
                      className="bg-yellow-600 hover:bg-[#c79b45] text-white rounded-full p-2"
                      onClick={() => {
                        setIsAddModalOpen(true);
                        setEditingContact(contact);
                      }}
                      title="Edit Contact"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 11l6.293-6.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L13 15l-4 1 1-4z"
                        />
                      </svg>
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                      onClick={() => handleDelete(contact.id)}
                      title="Delete Contact"
                    >
                      <RiDeleteBinLine className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddContactModal
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingContact(null);
          }}
          refreshContacts={fetchContacts}
          contactToEdit={editingContact}
        />
      )}
      {isImportModalOpen && (
        <ImportContactModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
};

export default Contacts;
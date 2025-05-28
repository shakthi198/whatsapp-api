import { HiChevronRight } from "react-icons/hi";
import { LuUsers, LuSquarePlus } from "react-icons/lu";
import { MdOutlineInbox } from "react-icons/md";
import { TbDownload, TbUpload } from "react-icons/tb";
import { RiDeleteBinLine } from "react-icons/ri";
import AddContactModal from "../Components/AddContactModal";
import ImportContactModal from "../Components/ImportContactModal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from 'file-saver';
import apiEndpoints from "../apiconfig";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTag, setSearchTag] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      const response = await axios.get(apiEndpoints.addContact);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Delete Functions
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await axios.delete(apiEndpoints.addContact, {
          data: { id }
        });
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
      try {
        await axios.delete(apiEndpoints.addContact, {
          data: { ids: selectedContacts }
        });
        setSelectedContacts([]);
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contacts:", error);
      }
    }
  };

  // Import/Export Functions
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
      ...contacts.map(contact => 
        `"${contact.contact_name}","${contact.contact_group}","${contact.tags}","${contact.mobile_number}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "contacts_export.csv");
  };

  const handleSampleCSV = () => {
    const sampleData = [
      ["Contact Name", "Group Name", "Tags", "Mobile Number"],
      ["John Doe", "Friends", "close-friend", "+1234567890"],
      ["Jane Smith", "Work", "colleague", "+1987654321"]
    ].join("\n");

    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "contacts_sample.csv");
  };

  // Selection Functions
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(contacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const toggleSelectContact = (id, isChecked) => {
    if (isChecked) {
      setSelectedContacts([...selectedContacts, id]);
    } else {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-medium">Contacts</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-yellow-600 text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-yellow-600">contacts</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-t-md flex items-center justify-between shadow-md">
        <div className="flex space-x-4">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded text-gray-500 w-32 focus:outline-none focus:border-yellow-600"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <option value="All">All</option>
          </select>
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Search tag"
            className="border border-gray-300 p-2 rounded text-gray-600 w-72 text-sm focus:outline-none focus:border-yellow-600"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          />
        </div>
      </div>
      <hr />

      {/* Action Buttons */}
      <div className="bg-white p-4 flex items-center justify-start space-x-2">
        <button 
          className="text-center text-gray-600 rounded flex items-center text-2xl hover:cursor-pointer" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <LuSquarePlus />
        </button>
        <button
          className="px-4 py-2 rounded flex items-center text-gray-600 text-2xl hover:cursor-pointer"
          onClick={handleBulkDelete}
        >
          <RiDeleteBinLine />
        </button>
        <button 
          className="px-3 py-2 rounded flex items-center text-gray-600 text-2xl hover:cursor-pointer" 
          onClick={() => setIsImportModalOpen(true)}
        >
          <TbUpload />
        </button>
        <button 
          className="px-3 py-2 rounded flex items-center text-gray-600 text-2xl hover:cursor-pointer"
          onClick={handleExport}
        >
          <TbDownload />
        </button>
        <button 
          className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center hover:cursor-pointer" 
          onClick={() => navigate("/manage-groups")}
        >
          <LuUsers className="mr-2" /> Manage Groups
        </button>
        <button 
          className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center hover:cursor-pointer"
          onClick={handleSampleCSV}
        >
          <TbDownload className="mr-2" /> Sample CSV File
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white p-4 rounded-b-md">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <thead className="bg-gray-100 text-left font-semibold text-gray-800">
              <tr>
                <th className="px-4 py-2">
                  <input 
                    type="checkbox" 
                    className="form-checkbox" 
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
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
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <MdOutlineInbox className="mx-auto text-gray-400 mt-6" size={72} />
                    <p>No data</p>
                  </td>
                </tr>
              ) : (
                contacts.map((contact, index) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input 
                        type="checkbox" 
                        className="form-checkbox" 
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => toggleSelectContact(contact.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 text-gray-700">{contact.contact_name}</td>
                    <td className="px-4 py-2 text-gray-700">{contact.contact_group}</td>
                    <td className="px-4 py-2 text-gray-700">{contact.tags}</td>
                    <td className="px-4 py-2 text-gray-700">{contact.mobile_number}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      <button
                        className="bg-yellow-600 hover:bg-[#c79b45] text-white rounded-full p-2 transition duration-150"
                        onClick={() => {
                          // Edit functionality would go here
                        }}
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
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition duration-150"
                        onClick={() => handleDelete(contact.id)}
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
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddContactModal 
          onClose={() => setIsAddModalOpen(false)} 
          onContactAdded={fetchContacts}
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
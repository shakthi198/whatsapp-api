import { HiChevronRight } from "react-icons/hi";
import { MdOutlineInbox } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiEndpoints from "../apiconfig";

const ManageGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [allContacts, setAllContacts] = useState([]); // for Add Member popup
  const [loadingContacts,setLoadingContacts]=useState(false);
  const [viewGroup,setViewGroup]=useState(null);

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const res = await fetch(apiEndpoints.getGroups);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setGroups(data.data);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    }
  };

  // Fetch all contacts
const fetchContacts = async () => {
  try {
    const res = await fetch(apiEndpoints.addContact);
    const data = await res.json();
    setAllContacts(Array.isArray(data) ? data : data.data || []); // ✅ change here
  } catch (err) {
    console.error("Error fetching contacts:", err);
  }
};

  useEffect(() => {
    fetchGroups();
    fetchContacts();
  }, []);

  // Open modal for editing a specific group
  const handleEditMembers = async (groupName) => {
    setSelectedGroup({ groupname: groupName });
    setShowModal(true);
    setLoading(true);

    try {
      const res = await fetch(apiEndpoints.getGroups, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: groupName }),
      });
      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        setContacts(data.data); // All contacts returned from backend
        // Some backends might not include `id` → fallback with mobile number
        setSelectedMembers(data.data.map((c) => c.id || c.mobile_number));
      } else {
        setContacts([]);
        setSelectedMembers([]);
      }
    } catch (err) {
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add/remove member selection
  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Save group member changes
  const handleSaveMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoints.addContact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_members",
          group: selectedGroup.groupname,
          members: selectedMembers,
        }),
      });
      const data = await res.json();
      if (data.status) {
        alert("Group members updated successfully!");
        fetchGroups();
      } else {
        alert(data.message || "Failed to update members");
      }
    } catch (err) {
      console.error("Error updating members:", err);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

const handleViewContacts = async (groupName) => {
  setViewGroup(groupName);
  setLoadingContacts(true);
  try {
    const res = await fetch(apiEndpoints.getGroups, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: groupName }),
    });
    const data = await res.json();
    if (data.status) setContacts(data.data);
    else setContacts([]);
  } catch (err) {
    console.error(err);
    setContacts([]);
  } finally {
    setLoadingContacts(false);
  }
};
  // Delete group
  const handleDeleteGroup = async (groupname) => {
    if (!window.confirm(`Are you sure you want to delete "${groupname}"?`))
      return;

    try {
      const res = await fetch(apiEndpoints.getGroups, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_group", group: groupname }),
      });
      const data = await res.json();
      if (data.status) {
        alert("Group deleted successfully!");
        fetchGroups();
      } else {
        alert(data.message || "Failed to delete group");
      }
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  const filteredGroups = Array.isArray(groups)
    ? groups.filter(
        (g) =>
          g.groupname &&
          g.groupname.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen  xl:w-full lg:w-2xl md:w-md p-4 md:p-6 bg-gray-100">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-2 md:gap-4">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-700">
          Manage Groups
        </h2>
        <div className="flex items-center flex-wrap text-yellow-600 text-sm gap-x-1">
          <span>Home</span>
          <HiChevronRight className="text-black" />
          <span>Manage Groups</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search Group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 text-gray-500 px-4 py-2 text-sm rounded-md w-full md:w-1/3 focus:outline-none focus:border-yellow-600"
        />
        <button
          onClick={() => navigate("/allcontacts")}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Manage Contacts
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md w-full mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 min-w-[500px] md:min-w--full">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 :px-6 py-4 border-r border-gray-300">
                S.No.
              </th>
              <th className="px-4 lg:px-6 py-4 border-r border-gray-300">
                Group Name
              </th>
              <th className="px-4 lg:px-6 py-4 border-r border-gray-300">
                Total Contacts
              </th>
              <th className="px-4 lg:px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  <MdOutlineInbox
                    className="mx-auto text-gray-400 mb-2"
                    size={48}
                  />
                  <p>No groups found</p>
                </td>
              </tr>
            ) : (
              filteredGroups.map((group, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="px-4 lg:px-6 py-3 border-r border-gray-300">
                    {i + 1}
                  </td>
                  <td className="px-4 lg:px-6 py-3 border-r border-gray-300">
                    {group.groupname}
                  </td>
                  <td className="px-4 lg:px-6 py-3 border-r border-gray-300">
                    {group.total_contacts}
                  </td>
                  <td className="px-4 lg:px-6 py-3 space-x-4">
                    <button
                      className="text-yellow-600 hover:underline text-sm"
                      onClick={() => handleViewContacts(group.groupname)}
                    >
                      View
                    </button>
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => handleEditMembers(group.groupname)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDeleteGroup(group.groupname)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50 p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <AiOutlineClose className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">
              Members in {selectedGroup.groupname}
            </h2>

            {/* Current members list */}
            {selectedMembers.length === 0 ? (
              <p className="text-gray-500 text-center mb-3">
                No members in this group
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto border rounded p-2 mb-4">
                {contacts
                  .filter((c) =>
                    selectedMembers.includes(c.id || c.mobile_number)
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex justify-between items-center border-b py-1"
                    >
                      <span>
                        {c.contact_name} ({c.mobile_number})
                      </span>
                      <button
                        className="text-red-500 text-sm hover:underline"
                        onClick={() =>
                          setSelectedMembers((prev) =>
                            prev.filter(
                              (id) => id !== (c.id || c.mobile_number)
                            )
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Add member button */}
            <button
              onClick={() => setShowAddPopup(true)}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 mb-4"
            >
              + Add Member
            </button>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMembers}
                className="bg-yellow-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg relative shadow-lg">
            <button
              onClick={() => setShowAddPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <AiOutlineClose className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">
              Add Member to {selectedGroup.groupname}
            </h2>

            <div className="max-h-64 overflow-y-auto border rounded p-2">
              {allContacts
                .filter(
                  (c) => !selectedMembers.includes(c.id || c.mobile_number)
                )
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border-b py-1"
                  >
                    <span>
                      {c.contact_name} ({c.mobile_number})
                    </span>
                    <button
                      className="text-yellow-600 text-sm hover:underline"
                      onClick={() => {
                        setSelectedMembers((prev) => [...prev, c.id]);
                        setContacts((prev) => [...prev, c]); // ✅ keep visible in UI
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      {viewGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50 p-4 overflow-auto">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg relative shadow-lg">
            <button
              onClick={() => setViewGroup(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <AiOutlineClose className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center md:text-left">
              Contacts in {viewGroup}
            </h2>
            {loadingContacts ? (
              <p className="text-gray-500 text-center">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-gray-500 text-center">
                No contacts found in this group
              </p>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-sm text-gray-600 min-w-[400px]">
                  <thead className="bg-gray-50 text-gray-700 text-sm">
                    <tr>
                      <th className="px-4 py-2 border-r border-gray-300">
                        S. No.
                      </th>
                      <th className="px-4 py-2 border-r border-gray-300">
                        Name
                      </th>
                      <th className="px-4 py-2">Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 border-r border-gray-300">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 border-r border-gray-300">
                          {contact.contact_name}
                        </td>
                        <td className="px-4 py-2">
                          {contact.country_code + contact.mobile_number}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroups;

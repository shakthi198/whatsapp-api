import { HiChevronRight } from "react-icons/hi";
import { LuUsers } from "react-icons/lu";
import { MdOutlineInbox } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiEndpoints from "../apiconfig";

const ManageGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewGroup, setViewGroup] = useState(null); // group to view contacts
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoints.getGroups);
      const data = await res.json();
      if (data.status) setGroups(data.data);
      else setGroups([]);
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.contact_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewContacts = async (groupName) => {
    setViewGroup(groupName);
    setLoadingContacts(true);
    try {
      const res = await fetch(apiEndpoints.getGroups, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: groupName })
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

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-2 md:gap-4">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-700">Manage Groups</h2>
        <div className="flex items-center flex-wrap text-yellow-600 text-sm gap-x-1">
          <span>Home</span>
          <HiChevronRight className="text-black" />
          <span>Manage Groups</span>
        </div>
      </div>

      {/* Search Input and Button */}
      <div className="bg-white p-4 md:p-7 rounded-t-md shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 w-full">
        <input
          type="text"
          placeholder="Search Group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 text-gray-500 px-4 py-2 text-sm rounded-md w-full md:w-1/3 focus:outline-none focus:border-yellow-600"
        />
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center justify-center hover:cursor-pointer w-full md:w-auto"
          onClick={() => navigate("/")}
        >
          <LuUsers className="mr-2" /> Manage Contacts
        </button>
      </div>
      <hr />

      {/* Table Section */}
      <div className="bg-white rounded-b-md w-full overflow-x-auto mt-3">
        <table className="w-full text-left text-sm text-gray-600 min-w-[500px] md:min-w-full">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 md:px-6 py-4 border-r border-gray-300">S. No.</th>
              <th className="px-4 md:px-6 py-4 border-r border-gray-300">Group Name</th>
              <th className="px-4 md:px-6 py-4 border-r border-gray-300">Total Contacts</th>
              <th className="px-4 md:px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  <MdOutlineInbox className="mx-auto text-gray-400 mb-2" size={48} />
                  <p>No groups found</p>
                </td>
              </tr>
            ) : (
              filteredGroups.map((group, index) => (
                <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-3 border-r border-gray-300">{index + 1}</td>
                  <td className="px-4 md:px-6 py-3 border-r border-gray-300">{group.contact_group}</td>
                  <td className="px-4 md:px-6 py-3 border-r border-gray-300">{group.total_contacts}</td>
                  <td className="px-4 md:px-6 py-3">
                    <button
                      className="text-yellow-600 hover:underline text-sm"
                      onClick={() => handleViewContacts(group.contact_group)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing contacts */}
      {viewGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50 p-4 overflow-auto">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg relative shadow-lg">
            <button
              onClick={() => setViewGroup(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <AiOutlineClose className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Contacts in {viewGroup}</h2>

            {loadingContacts ? (
              <p className="text-gray-500 text-center">Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p className="text-gray-500 text-center">No contacts found in this group</p>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-sm text-gray-600 min-w-[400px]">
                  <thead className="bg-gray-50 text-gray-700 text-sm">
                    <tr>
                      <th className="px-4 py-2 border-r border-gray-300">S. No.</th>
                      <th className="px-4 py-2 border-r border-gray-300">Name</th>
                      <th className="px-4 py-2">Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, idx) => (
                      <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 border-r border-gray-300">{idx + 1}</td>
                        <td className="px-4 py-2 border-r border-gray-300">{contact.contact_name}</td>
                        <td className="px-4 py-2">{contact.country_code + contact.mobile_number}</td>
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

import { HiChevronRight } from "react-icons/hi";
import { LuUsers } from "react-icons/lu";
import { MdOutlineInbox } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ManageGroups = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-3xl text-gray-700 font-medium">Manage Groups</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">Manage Groups</span>
        </div>
      </div>

      {/* Search Input and Button */}
      <div className="bg-white p-7 rounded-t-md shadow-md flex items-center justify-between w-full">
        <input
          type="text"
          placeholder="Search Group"
          className="border border-gray-300 text-gray-500 px-4 py-2 text-sm rounded-md w-1/6 focus:outline-none focus:border-[#DDA853]"
        />
        <button className="bg-[#DDA853] text-white px-4 py-2 rounded flex items-center hover:cursor-pointer" onClick={() => navigate("/")}>
          <LuUsers className="mr-2" /> Manage Contacts
        </button>
      </div>
<hr/>
      {/* Table Section */}
      <div className="bg-white rounded-b-md w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-6 py-6 border-r border-gray-300">S. No.</th>
              <th className="px-6 py-6 border-r border-gray-300">Group Name</th>
              <th className="px-6 py-6 border-r border-gray-300">Total Contacts</th>
              <th className="px-6 py-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* No Data State */}
            <tr>
              <td colSpan="4" className="text-center py-8 text-gray-500">
                <MdOutlineInbox className="mx-auto text-gray-400 mb-2" size={48} />
                <p>No data</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageGroups;
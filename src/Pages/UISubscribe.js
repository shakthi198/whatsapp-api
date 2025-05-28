import { HiChevronRight } from "react-icons/hi";
import { MdOutlineInbox } from "react-icons/md"; // For No Data Icon
import { useState } from "react";

const UISubscribe = () => {
  // Dummy contacts array - empty for testing "No data" UI
  const [contacts, setContacts] = useState([]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <h2 className="text-3xl text-gray-700 font-medium">UnSubscribe</h2>
        <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
        <div className="text-[#DDA853] text-md flex items-center">
          <span>Home</span>
          <HiChevronRight className="mx-1 text-black text-md" />
          <span className="text-[#DDA853]">Unsubscribe</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white  rounded-b-md">
  <table className="w-full rounded-b-md mt-2">
              <thead className="font-medium">
                <tr className="bg-gray-200 text-gray-700 text-left">
                  <th className="p-2 border-r border-gray-300">S.No.</th>
                  <th className="p-2 border-r border-gray-300">Name</th>
                  <th className="p-2  border-gray-300">Mobile Number</th>
                
                </tr>
              </thead>
              <tbody>
              {contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <tr
                  key={contact.id}
                  className={`hover:bg-gray-50 transition-all cursor-pointer border-gray-300 ${
                    index === 1 ? "" : "border-t border-gray-300"
                  }`}
                >
                  <td className="p-2">{index + 1}</td>
                  <td className="px-6 py-4">{contact.name}</td>
                  <td className="px-6 py-4">{contact.mobile}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <MdOutlineInbox className="text-gray-400 text-6xl mb-2" />
                    <p className="text-gray-400 text-sm">No data</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
            </table>
          </div>
    </div>
  );
};

export default UISubscribe;
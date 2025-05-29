import { HiChevronRight } from "react-icons/hi";
import { MdOutlineInbox } from "react-icons/md";
import { useState } from "react";

const UISubscribe = () => {
  const [contacts, setContacts] = useState([]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h1 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">UnSubscribe</h1>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Unsubscribe</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-md">
        <table className="w-full rounded-b-md mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <thead className="font-medium">
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="p-2 border-r border-gray-300">S.No.</th>
              <th className="p-2 border-r border-gray-300">Name</th>
              <th className="p-2 border-gray-300">Mobile Number</th>
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
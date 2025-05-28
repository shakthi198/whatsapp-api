import { useRef, useState } from "react";
import { CiCircleQuestion } from "react-icons/ci";
import { AiOutlineClose,AiOutlineUpload }from "react-icons/ai";
import { MdOutlineInbox } from "react-icons/md";

const ImportContactModal = ({onClose}) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState("Upload");
  
    const handleFileClick = () => {
      fileInputRef.current.click();
    };
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setFileName(file.name); // Show selected file name
      }
    };
    // if (!isOpen) return null; // Hide modal when isOpen is false
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-10">
  <div className="bg-white w-full p-8 shadow-lg ">

      <div className="flex justify-between items-center pb-3">
        <h2 className="text-lg font-semibold">Import contact</h2>
        <button className="top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer">
          <AiOutlineClose className="w-6 h-6" onClick={onClose}/>
        </button>
      </div>

        {/* Form Section */}
        <div className="grid grid-cols-3 gap-6">
          {/* Group Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Group</label>
            <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#DDA853] focus:border-[#DDA853]">
              <option>Select</option>
            </select>
          </div>

          {/* Choose CSV File */}
          <div>
      <label className="block text-sm font-medium text-gray-700">Choose CSV File</label>
      <div className="relative mt-1">
        <div
          className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#DDA853] focus:border-[#DDA853] cursor-pointer"
          onClick={handleFileClick}
        >
          <AiOutlineUpload className="text-gray-500 text-lg mr-2" />
          <span>{fileName}</span>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
    </div>

          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#DDA853] focus:border-[#DDA853]"
            />
          </div>

          {/* Country Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country Code <span className="text-red-500">*</span>
            </label>
            <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#DDA853] focus:border-[#DDA853]">
              <option>Select</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#DDA853] focus:border-[#DDA853]">
              <option>Select</option>
            </select>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex items-center justify-end mt-6 mr-9 space-x-2 bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center gap-2 text-md">
            <button className="bg-[#DDA853] text-white px-5 py-2 rounded-md">View Preview</button>
            <CiCircleQuestion className="text-[#DDA853] text-md" />
          </div>
          <button className="bg-red-500 text-white px-5 py-2 rounded-md">Reset File</button>
        </div>

        {/* Data Table Section */}
        <div className="bg-white mt-8 rounded-b-md w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 ">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="px-6 py-4">S.No.</th>
                <th className="px-6 py-4">Contact Name</th>
                <th className="px-6 py-4">Mobile Number</th>
              </tr>
            </thead>
            <tbody>
              {/* No Data Row */}
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="text-gray-400 mb-2">
                      <MdOutlineInbox className="text-6xl" />
                    </div>
                    <p>No data</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Import to Contacts Button */}
        <div className="flex justify-end mt-6">
          <button className="bg-[#DDA853] text-white px-6 py-2 rounded-md">Import to Contacts</button>
        </div>
      </div>
    </div>
  );
};

export default ImportContactModal;
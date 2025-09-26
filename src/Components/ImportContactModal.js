import { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineUpload } from "react-icons/ai";
import { CiCircleQuestion } from "react-icons/ci";
import axios from "axios";
import apiEndpoints from "../apiconfig"; // ensure this is inside src/

const ImportContactModal = ({ onClose, onImport }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("Upload CSV");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [previewContacts, setPreviewContacts] = useState([]); // <-- Preview state

  // Fetch groups from backend
  const fetchGroups = async () => {
    try {
      const response = await axios.get(apiEndpoints.getGroups);
      if (response.data.status && Array.isArray(response.data.data)) {
        setGroups(response.data.data);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);

      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const rows = event.target.result
          .split("\n")
          .filter(row => row.trim() !== "" && !row.includes("contact_name")); // skip header
        const contacts = rows.map(row => {
          const [contact_name, country_code, mobile_number] = row.split(",");
          return {
            contact_name: contact_name?.trim(),
            country_code: country_code?.trim(),
            mobile_number: mobile_number?.trim()
          };
        });
        setPreviewContacts(contacts);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!selectedGroup) return alert("Please select a group");
    if (!file) return alert("Please upload a CSV file");

    try {
      const response = await axios.post(apiEndpoints.addContact, {
        action: "import",
        contact_group: selectedGroup,
        contacts: previewContacts
      });

      if (response.data.status) {
        alert("Contacts imported successfully!");
        if (onImport) onImport(previewContacts); // refresh parent table immediately
        onClose();
      } else {
        alert(response.data.message || "Import failed");
        console.log(response.data.errors);
      }
    } catch (err) {
      console.error("Error importing contacts:", err);
      alert("Import failed. Check console.");
    }
  };

  // Download sample CSV with headers
  const downloadSampleCSV = () => {
    const sample = "contact_name,country_code,mobile_number\nJohn Doe,91,1234567890\nJane Smith,91,9876543210";
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_contacts.csv";
    link.click();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4 overflow-auto z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-md shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Import Contacts</h2>
          <button onClick={onClose}>
            <AiOutlineClose className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Select Group <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-yellow-600 focus:border-yellow-600"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- Select Group --</option>
            {groups.map((grp, index) => (
              <option key={index} value={grp.contact_group}>
                {grp.contact_group} ({grp.total_contacts})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Upload CSV</label>
          <div
            onClick={handleFileClick}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
          >
            <AiOutlineUpload className="mr-2 text-gray-500 text-lg" />
            <span>{fileName}</span>
          </div>
          <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Preview Table */}
        {previewContacts.length > 0 && (
          <div className="mb-4 max-h-64 overflow-y-auto border border-gray-200 rounded">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-2 border-r border-gray-300">S. No.</th>
                  <th className="px-4 py-2 border-r border-gray-300">Name</th>
                  <th className="px-4 py-2 border-r border-gray-300">Country Code</th>
                  <th className="px-4 py-2">Mobile Number</th>
                </tr>
              </thead>
              <tbody>
                {previewContacts.map((contact, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-4 py-2 border-r border-gray-300">{idx + 1}</td>
                    <td className="px-4 py-2 border-r border-gray-300">{contact.contact_name}</td>
                    <td className="px-4 py-2 border-r border-gray-300">{contact.country_code}</td>
                    <td className="px-4 py-2">{contact.mobile_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            <CiCircleQuestion /> Sample CSV
          </button>
          <button
            onClick={handleImport}
            className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-500"
          >
            Import Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportContactModal;

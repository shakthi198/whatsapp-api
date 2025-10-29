import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import apiEndpoints from "../apiconfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddContactModal = ({ onClose, refreshContacts, contactToEdit }) => {
  const [groupOptions, setGroupOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("single"); // "single" or "group"
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  

  const [formData, setFormData] = useState({
    country_code: "+91",
    mobile_number: "",
    contact_name: "",
    tags: ""
  });

  // Fetch existing groups
  const fetchGroups = async () => {
    try {
      const res = await fetch(apiEndpoints.getGroups); // your groups.php endpoint
      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        // Adjust to use 'groupname' instead of 'contact_group'
        setGroupOptions(data.data.map((g) => g.groupname));
      } else {
        setGroupOptions([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroupOptions([]);
    }
  };


  useEffect(() => {
      fetchGroups();
    }, []);

const fetchAllContacts = async () => {
  try {
    const res = await fetch(apiEndpoints.addContact);
    const data = await res.json();

    if (Array.isArray(data)) {
      // Direct array (from add_contact.php GET)
      setAllContacts(data);
    } else if (Array.isArray(data.data)) {
      // Wrapped format (from other endpoints)
      setAllContacts(data.data);
    } else {
      setAllContacts([]);
    }
  } catch (err) {
    console.error("Error fetching all contacts:", err);
    setAllContacts([]);
  }
};


  useEffect(() => {
    fetchAllContacts();
  }, []);


  useEffect(() => {
    if (contactToEdit) {
      setFormData({
        country_code: contactToEdit.country_code || "+91",
        mobile_number: contactToEdit.mobile_number || "",
        contact_name: contactToEdit.contact_name || "",
        tags: contactToEdit.tags || ""
      });
      setSelectedGroup(contactToEdit.contact_group || "");
      setSearchTerm(contactToEdit.contact_group || "");
    }
  }, [contactToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGroup = async () => {
    if (!searchTerm.trim()) return toast.error("Enter group name");

    try {
      const res = await fetch(apiEndpoints.addContact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_group",
          contact_group: searchTerm.trim(),
        }),
      });


      const result = await res.json();
      if (result.status) {
        toast.success(result.message);
        fetchGroups();  // refresh dropdown
        setSelectedGroup(searchTerm.trim());
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error adding group:", err);
      toast.error("Failed to add group");
    }
  };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setIsSubmitting(true);
   setError(null);

   try {
     if (mode === "group") {
       if (!searchTerm.trim()) return setError("Please enter a group name");
       if (selectedContacts.length === 0)
         return setError("Select at least one contact for the group");

       const res = await fetch(apiEndpoints.addContact, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           action: "create_group",
           group_name: searchTerm.trim(),
           contacts: selectedContacts,
         }),
       });

       const result = await res.json();
       if (!result.status)
         throw new Error(result.message || "Failed to create group");
       toast.success("Group created successfully!");
     } else {
       // existing single contact logic
       const groupToSend = selectedGroup || searchTerm;
       if (!groupToSend) throw new Error("Select or enter a group");
       if (!formData.mobile_number || !formData.contact_name)
         throw new Error("Mobile number and contact name are required");

       const payload = {
         contact_group: groupToSend,
         country_code: formData.country_code,
         mobile_number: formData.mobile_number,
         contact_name: formData.contact_name,
         tags: formData.tags || "",
         action: contactToEdit ? "edit" : "add",
         ...(contactToEdit ? { id: contactToEdit.id } : {}),
       };

       const response = await fetch(apiEndpoints.addContact, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       });

       const result = await response.json();
       if (!result.status)
         throw new Error(result.message || "Operation failed");
       toast.success(contactToEdit ? "Contact updated!" : "Contact added!");
     }

     if (refreshContacts) refreshContacts();
     onClose();
   } catch (err) {
     console.error(err);
     toast.error(err.message || "Operation failed");
   } finally {
     setIsSubmitting(false);
   }
 };


const filteredOptions = Array.isArray(groupOptions)
  ? groupOptions.filter(
      (g) =>
        typeof g === "string" &&
        g.toLowerCase().includes((searchTerm || "").toLowerCase())
    )
  : [];


  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] z-50">
        <div className="bg-white w-full max-w-md p-6 shadow-lg rounded-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <AiOutlineClose className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold mb-6">
            {contactToEdit ? "Edit Contact" : "Add Contact"}
          </h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Toggle: Single or Group creation */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  mode === "single" ? "bg-yellow-600 text-white" : "bg-gray-200"
                }`}
                onClick={() => setMode("single")}
              >
                Single Contact
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${
                  mode === "group" ? "bg-yellow-600 text-white" : "bg-gray-200"
                }`}
                onClick={() => setMode("group")}
              >
                Create Group
              </button>
            </div>

            {/* Form fields */}
            {mode === "single" ? (
              <>
                {/* Group Input (keep your existing code here) */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group 
                  </label>
                  <div className="relative flex">
                    <input
                      type="text"
                      placeholder="Select or enter group"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedGroup(e.target.value);
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                      className="w-full px-3 py-2 pr-24 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddGroup}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                    >
                      Add Group
                    </button>
                  </div>
                  {isFocused && filteredOptions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full max-h-40 overflow-y-auto mt-1 rounded shadow-md z-50">
                      {filteredOptions.map((g, idx) => (
                        <li
                          key={idx}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSearchTerm(g);
                            setSelectedGroup(g);
                            setIsFocused(false);
                          }}
                        >
                          {g}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Country Code + Mobile Number */}
                <div className="flex gap-4 mb-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country Code <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country_code"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                      value={formData.country_code}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="+91">India (+91)</option>
                      <option value="+1">USA (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+65">Singapore (+65)</option>
                      <option value="+971">UAE (+971)</option>
                    </select>
                  </div>
                  <div className="w-2/3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile_number"
                      placeholder="Mobile number"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                      required
                    />
                  </div>
                </div>

                {/* Contact Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    placeholder="Contact Name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-600"
                  />
                </div>
              </>
            ) : (
              <>
                {/* GROUP CREATION MODE */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded w-full"
                    placeholder="Enter new group name"
                    required
                  />
                </div>

                <div className="max-h-64 overflow-y-auto border rounded p-2">
                  {allContacts.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No contacts available to add.
                    </p>
                  ) : (
                    allContacts.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(c.id)}
                          onChange={() =>
                            setSelectedContacts((prev) =>
                              prev.includes(c.id)
                                ? prev.filter((id) => id !== c.id)
                                : [...prev, c.id]
                            )
                          }
                        />
                        <span>
                          {c.contact_name} ({c.mobile_number})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Submit / Cancel Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-[#c49a4b] transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? contactToEdit
                    ? "Updating..."
                    : "Saving..."
                  : contactToEdit
                  ? "Update Contact"
                  : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddContactModal;

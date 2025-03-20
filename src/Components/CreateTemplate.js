import { useState, useEffect } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const CreateTemplate = ({ onSubmit, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state with the template data if it exists
  const [templateBody, setTemplateBody] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddAttributePopup, setShowAddAttributePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });

  const [formData, setFormData] = useState({
    templateName: "",
    category: "",
    language: "",
    type: "",
    erpCategory: "",
    status: "Approved",
    createdOn: new Date().toLocaleString(), // Include both date and time
  });

  // Use useEffect to set the form data when the component mounts
  useEffect(() => {
    if (location.state?.template) {
      const { template } = location.state;
      setFormData({
        templateName: template.templateName,
        category: template.category,
        language: template.language,
        type: template.type,
        erpCategory: template.erpCategory,
        status: template.status,
        createdOn: template.createdOn,
      });
      setTemplateBody(template.templateBody);
      setTemplateFooter(template.templateFooter);
      setAttributes(template.attributes || []);
    }
  }, [location.state]);

  const handleAddAttribute = () => {
    setNewAttribute({ name: "", value: "" });
    setShowAddAttributePopup(true);
  };

  const handleCloseAddPopup = () => {
    setShowAddAttributePopup(false);
  };

  const handleSaveAttribute = () => {
    if (newAttribute.name.trim() !== "" && newAttribute.value.trim() !== "") {
      setAttributes([...attributes, newAttribute]);
      setShowAddAttributePopup(false);
    }
  };

  const handleDelete = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.templateName || !formData.category || !formData.language || !formData.type || !formData.erpCategory) {
      alert("Please fill all required fields.");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      ...formData,
      templateBody,
      templateFooter,
      attributes,
    };

    const savedTemplates = JSON.parse(localStorage.getItem("templates")) || [];
    const isDuplicate = savedTemplates.some(template => template.id === newTemplate.id);

    if (!isDuplicate) {
      savedTemplates.push(newTemplate);
      localStorage.setItem("templates", JSON.stringify(savedTemplates));
    }

    navigate("/templates", { state: { template: newTemplate } });
  };

  return (
    <div className="flex min-h-screen justify-center items-center" style={{ fontFamily: "Montserrat" }}>
      <div className="bg-white shadow-md p-6 rounded-lg w-6xl w-full border border-gray-400 flex">
        {/* Left Side - Form */}
        <div className="w-2/3 pr-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Create New Template</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                Template Name <FaQuestionCircle className="ml-2 text-black-500" />
              </label>
              <input
                type="text"
                className="border border-gray-400 p-2 rounded w-full text-gray-700"
                name="templateName"
                placeholder="Template Name"
                value={formData.templateName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                Category <FaQuestionCircle className="ml-2 text-black-500" />
              </label>
              <select
                className="border border-gray-400 p-2 rounded w-full text-gray-700"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" hidden></option>
                <option value="MARKETING">MARKETING</option>
                <option value="UTILITY">UTILITY</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                className="border border-gray-400 p-2 rounded w-full text-gray-700"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="" hidden></option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ru">Russian</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="ko">Korean</option>
                <option value="nl">Dutch</option>
                <option value="tr">Turkish</option>
                <option value="sv">Swedish</option>
                <option value="pl">Polish</option>
                <option value="id">Indonesian</option>
                <option value="th">Thai</option>
                <option value="vi">Vietnamese</option>
                <option value="he">Hebrew</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template Type</label>
              <select
                className="border border-gray-400 p-2 rounded w-full text-gray-700"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="" hidden></option>
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="FILE">File</option>
                <option value="CAROUSEL">Carousel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ERP Category</label>
              <select
                className="border border-gray-400 p-2 rounded w-full text-gray-700"
                name="erpCategory"
                value={formData.erpCategory}
                onChange={handleChange}
              >
                <option value="" hidden></option>
                <option value="SHOPIFY">Shopify</option>
                <option value="WOOCOMMERCE">WooCommerce</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Body</h3>
            <p className="text-sm text-gray-500">Make your messages personal using variables like and get more replies!</p>
            <button
              className="border border-yellow-600 text-yellow-600 mt-2 mb-3 px-4 py-2 rounded"
              onClick={() => setShowPopup(true)}
            >
              Add Variable
            </button>
          </div>

          <div className="border border-gray-400 p-4 rounded-md relative">
            <textarea
              placeholder="Template Body"
              className="w-full h-32 border-none outline-none text-gray-700"
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
            ></textarea>
          </div>
          <p className="text-sm flex justify-end mr-1 mt-1 text-gray-500">{templateBody.length}/1024 characters</p>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Interactive Actions (Optional)</h3>
            <select className="border border-gray-400 p-2 rounded w-full text-gray-700 mt-2">
              <option value="" hidden></option>
              <option value="">Call To Action</option>
              <option value="Quick Reply">Quick Reply</option>
            </select>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Template Footer (Optional)</h3>
            <p className="text-sm text-gray-500">Footers are great to add any disclaimers or to add a thoughtful PS and only up to 60 characters are allowed.</p>
            <input
              type="text"
              className="border border-gray-400 p-2 rounded w-full mt-2 text-gray-700"
              placeholder="Template Footer"
              value={templateFooter}
              onChange={(e) => setTemplateFooter(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Sample Variable</h3>
            <p className="text-sm text-gray-500">Just enter sample content here (it doesn’t need to be exact!)</p>
            <input
              type="text"
              className="border border-gray-400 p-2 rounded w-full mt-2 text-gray-700"
              placeholder="Enter sample content"
            />
            <p className="text-xs text-gray-500 mt-2">
              Make sure not to include any actual user or customer information, and provide only sample content in your examples.
            </p>
          </div>

          <div className="flex justify-end mt-4 space-x-4">
            <button className="border border-yellow-600 text-yellow-600 px-4 py-2 rounded cursor-not-allowed" disabled>
              Save as draft
            </button>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
              Submit Template
            </button>
          </div>
        </div>

        <div className="w-1/3 border border-gray-400 p-6 rounded-lg shadow-md bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">Preview</h3>
          <div className="border border-gray-300 p-4 mt-2 rounded-md h-64 text-gray-700 overflow-auto">
            {templateBody && <p className="mb-2"> {templateBody}</p>}
            {attributes.length > 0 && (
              <div className="mb-2">
                <ul>
                  {attributes.map((attr, index) => (
                    <li key={index}> {attr.value}</li>
                  ))}
                </ul>
              </div>
            )}
            {templateFooter && <p className="mt-2 text-gray-500"> {templateFooter}</p>}
            {!formData.templateName && !templateBody && attributes.length === 0 && !templateFooter && (
              <p>Your template preview will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center transition-opacity duration-300 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Attribute</h2>
              <button onClick={() => setShowPopup(false)} className="text-m font-bold">X</button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="🔍 Search attributes..."
                className="w-89 border p-2 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-[#D2B887] text-white py-2 px-4 rounded flex ml-20"
                onClick={handleAddAttribute}
              >
                + Add Attribute
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
              {attributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-full border border-green-400"
                >
                  {attr.name}: {attr.value}
                  <button
                    onClick={() => handleDelete(index)}
                    className="ml-2 bg-white text-red-500 p-1 rounded-full"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
            <div className="flex mt-4 items-center gap-2">
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
                <HiChevronLeft className="text-2xl" />
              </button>
              <button className="border border-[#DDA853] px-4 py-2 rounded-md text-black font-medium">
                1
              </button>
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-300">
                <HiChevronRight className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAttributePopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Add User Attribute</h2>
              <button onClick={handleCloseAddPopup}>&times;</button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter Attribute Name"
                className="w-full border p-2 rounded mt-1"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Value</label>
              <input
                type="text"
                placeholder="Enter Attribute Value"
                className="w-full border p-2 rounded mt-1"
                value={newAttribute.value}
                onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="border px-4 py-2 rounded" onClick={handleCloseAddPopup}>
                Cancel
              </button>
              <button className="bg-[#D2B887] text-white px-4 py-2 rounded" onClick={handleSaveAttribute}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTemplate;
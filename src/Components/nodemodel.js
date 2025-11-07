// NodeModal.js
import React, { useState } from "react";

// Load Montserrat font globally (can be added in index.css or Tailwind config)
// @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

const steps = ["Response", "Action", "Api", "Notify"];

const NodeModal = ({ isOpen, onClose, node, onSave }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    nodeName: node?.data?.label || "Node 1",
    description: node?.data?.description || "",
    type: node?.data?.type || "",
    triggerKeyword: node?.data?.triggerKeyword || "",
    fieldToStore: node?.data?.fieldToStore || "",
    assignAgent: node?.data?.assignAgent || "",
    apiConfig: node?.data?.apiConfig || {
      method: "GET",
      url: "",
      headers: [],
      body: {}
    },
    notify: node?.data?.notify || { userNumber: "", template: "" }
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Response
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">Response</h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter response text..."
              className="border p-2 rounded w-full h-24"
            />
          </div>
        );
      case 1: // Action
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">Action</h3>
            <label className="block mb-2">Button Type</label>
            <div className="flex space-x-4">
              <label>
                <input type="radio" name="buttonType" /> Button
              </label>
              <label>
                <input type="radio" name="buttonType" /> None
              </label>
            </div>
          </div>
        );
      case 2: // API
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">API Config</h3>
            <select
              value={formData.apiConfig.method}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  apiConfig: { ...prev.apiConfig, method: e.target.value }
                }))
              }
              className="border p-2 rounded mr-2"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={formData.apiConfig.url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  apiConfig: { ...prev.apiConfig, url: e.target.value }
                }))
              }
              placeholder="API URL"
              className="border p-2 rounded w-2/3"
            />
          </div>
        );
      case 3: // Notify
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">WhatsApp Notification</h3>
            <input
              type="text"
              placeholder="User Number"
              value={formData.notify.userNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notify: { ...prev.notify, userNumber: e.target.value }
                }))
              }
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Choose Template"
              value={formData.notify.template}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notify: { ...prev.notify, template: e.target.value }
                }))
              }
              className="border p-2 rounded w-full"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50 font-[Montserrat]"
    >
      <div className="bg-white w-11/12 max-w-5xl rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Edit Node</h2>

        {/* Top fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="nodeName"
            value={formData.nodeName}
            onChange={handleChange}
            placeholder="Node Name"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="triggerKeyword"
            value={formData.triggerKeyword}
            onChange={handleChange}
            placeholder="Trigger Keyword"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Step navigation */}
        <div className="flex justify-between border-b mb-4 pb-2">
          {steps.map((s, index) => (
            <div
              key={s}
              className={`flex-1 text-center cursor-pointer ${
                step === index
                  ? "text-yellow-600 font-semibold"
                  : "text-gray-500"
              }`}
              onClick={() => setStep(index)}
            >
              {index + 1}. {s}
            </div>
          ))}
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Footer buttons */}
        <div className="flex justify-between mt-6">
          <button
            disabled={step === 0}
            onClick={() => setStep((prev) => prev - 1)}
            className="px-4 py-2 rounded bg-gray-300 text-gray-800 disabled:opacity-50"
          >
            Previous
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              className="px-4 py-2 rounded bg-yellow-600 text-white"
            >
              Next
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-400 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-yellow-600 text-white"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeModal;
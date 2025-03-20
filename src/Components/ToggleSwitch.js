import React from "react";

const ToggleSwitch = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
        isOn ? "bg-[#DDA853]" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition ${
          isOn ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </button>
  );
};

export default ToggleSwitch;
import React from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { Handle } from "reactflow";

const CustomNode = ({ data, id, onDelete, color }) => {
  // Handle delete button click
  const handleDelete = (e) => {
    e.stopPropagation(); // Stop event propagation
    if (typeof onDelete === "function") {
      onDelete(id); // Call the onDelete function with the node ID
    } else {
      console.error("onDelete is not a function"); // Debugging
    }
  };

  return (
    <div className="custom-node" style={{ backgroundColor: color }}>
      {/* Connecting point at the top */}
      <Handle type="target" position="top" style={{ background: "#555" }} />

      {/* Node label */}
      <div className="node-label">{data.label}</div>

      {/* Delete button (only for non-default nodes) */}
      {!data.isDefault && (
        <button className="delete-button" onClick={handleDelete}>
          <RiDeleteBin5Line className="trash-icon" />
        </button>
      )}

      {/* Connecting point at the bottom */}
      <Handle type="source" position="bottom" style={{ background: "#555" }} />
    </div>
  );
};

export default CustomNode;
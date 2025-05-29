import React, { useCallback, useState } from "react";
import ReactFlow, { addEdge, Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import "../Css/Styles.css";
import CustomNode from '../Components/CustomNode';
import { useNavigate } from "react-router-dom";

const FlowChart = () => {
  const navigate = useNavigate();

  // Initial nodes with the default node
  const initialNodes = [
    {
      id: "1",
      type: "custom",
      position: { x: 250, y: 5 },
      data: { label: "Node 1", isDefault: true }, // Mark this node as default
      color: "#16a34a", // Green color for the default node
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  // Add a new node
  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: "custom",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `New Node`, isDefault: false }, // Mark this node as not default
      color: "#16a34a", // Green color for new nodes
    };
    setNodes((prev) => [...prev, newNode]);
  };

  // Delete a node by ID
  const deleteNode = useCallback((id) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.source !== id && edge.target !== id));
  }, []);

  // Define custom node types
  const nodeTypes = {
    custom: (props) => <CustomNode {...props} onDelete={deleteNode} />,
  };

  // Handle edge connection
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  // Handle saving the flow chart
  const handleSave = () => {
    const flowData = { nodes, edges };
    console.log("Saved Flow Data:", flowData);
    alert("Flow chart saved!");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center p-4">
      {/* Toolbar */}
      <div className="mb-4 flex justify-start w-full space-x-2">
        <button className="bg-yellow-600 px-4 py-2 rounded-md text-white cursor-pointer" onClick={addNode}>
          Add A Node
        </button>
        <button className="bg-yellow-600 px-4 py-2 rounded-md text-white cursor-pointer" onClick={handleSave}>
          Save
        </button>
        <button className="bg-yellow-600 px-4 py-2 rounded-md text-white cursor-pointer" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {/* Flow Chart Container */}
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesDelete={(nodes) => nodes.forEach((node) => deleteNode(node.id))}
          connectionLineStyle={{ stroke: "#000", strokeWidth: 2 }}
          connectionLineType="bezier"
          nodeTypes={nodeTypes} // Pass the custom node types
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowChart;
// FlowChart.js
import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "../Css/Styles.css"
import CustomNode from "./CustomNode";
import { useNavigate, useParams } from "react-router-dom";
import apiEndpoints from "../apiconfig";
import NodeModal from "./nodemodel";

// Define nodeTypes outside of the component to prevent recreation on every render
const nodeTypes = {
  custom: CustomNode,
};

const FlowChart = () => {
  const navigate = useNavigate();
  const { flowId } = useParams();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [chartId, setChartId] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete node
  const deleteNode = useCallback((id) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  }, [setNodes, setEdges]);

  // Rename node
  const renameNode = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
  }, [setNodes]);

  // Change color
  const changeNodeColor = useCallback((id, newColor) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, color: newColor } } : node
      )
    );
  }, [setNodes]);

  // Handle node double click to open modal
  const handleNodeDoubleClick = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsModalOpen(true);
    }
  }, [nodes]);

  // Load flow chart from API
  useEffect(() => {
    if (!flowId) return;

    fetch(`${apiEndpoints.flowchart}?flow_id=${flowId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const chart = data[0];
          setChartId(chart.id);

          try {
            let chartData = chart.chart_data;
            if (typeof chartData === "string") {
              chartData = JSON.parse(chartData);
            }

            setNodes(chartData.nodes || []);
            setEdges(chartData.edges || []);
          } catch (err) {
            console.error("Error parsing chart_data:", err);
            setNodes([
              {
                id: "1",
                type: "custom",
                position: { x: 250, y: 5 },
                data: { label: "Node 1", isDefault: true, flowId, color: "#16a34a" },
              },
            ]);
            setEdges([]);
          }
        }
      })
      .catch((err) => console.error("Error loading flowchart:", err));
  }, [flowId, setNodes, setEdges]);

  // Add a new node
  const addNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: "custom",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `New Node ${nodes.length + 1}`,
        isDefault: false,
        flowId,
        color: "#16a34a",
      },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  // Handle saving node data from modal
  const handleSaveNodeData = (nodeId, formData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...formData,
              label: formData.nodeName || node.data.label
            }
          };
        }
        return node;
      })
    );
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Save chart
  const handleSave = () => {
    const payload = {
      flow_id: Number(flowId),
      chart_data: { nodes, edges },
    };

    const method = "POST";
    const url = chartId
      ? `${apiEndpoints.flowchart}?id=${chartId}`
      : apiEndpoints.flowchart;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (!chartId) setChartId(data.id);
          alert("Flow chart saved successfully!");
        } else {
          console.error("Save failed:", data);
        }
      })
      .catch((err) => console.error("Error saving flowchart:", err));
  };

  return (
    <div className="h-screen w-full flex flex-col items-center p-4">
      {flowId && <div className="mb-2 text-lg font-medium">Editing Flow: {flowId}</div>}

      {/* Toolbar */}
      <div className="mb-4 flex justify-start w-full space-x-2">
        <button className="bg-yellow-600 px-4 py-2 rounded-md text-white" onClick={addNode}>
          Add A Node
        </button>
        <button className="bg-yellow-600 px-4 py-2 rounded-md text-white" onClick={handleSave}>
          Save
        </button>
        <button className="bg-yellow-600 px-4 py-2 rounded-md text-white" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {/* Flow Chart */}
      <div className="flow-container" style={{ width: "100%", height: "80vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={(event, node) => handleNodeDoubleClick(node.id)} // Add this line
          connectionLineStyle={{ stroke: "#000", strokeWidth: 2 }}
          connectionLineType="bezier"
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <NodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        node={selectedNode}
        onSave={handleSaveNodeData}
      />
    </div>
  );
};

export default FlowChart;
import React from "react"
import {useState} from "react" 
import { Handle, Position } from "reactflow";
function AvgPool({ id, data, setNodes }) {
  const [dim, setDim] = useState(data.dim ?? "1d");

  const handleDimChange = (newDim) => {
    setDim(newDim);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, dim: newDim } } : node
      )
    );
  };

  const handleChange = (e, field) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      )
    );
  };

  return (
    <div style={{
      padding: 5,
      border: "1px solid black",
      borderRadius: 3,
      backgroundColor: "white",
      minWidth: 120,
      minHeight: 50,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
    }}>
      <Handle type="target" position={Position.Top} id="in" style={{ background: "black" }} />
      <Handle type="source" position={Position.Bottom} id="out" style={{ background: "black" }} />

      <h4 style={{ margin: 0 }}>AvgPool ({dim})</h4>

      <select value={dim} onChange={(e) => handleDimChange(e.target.value)}>
        <option value="1d">1D</option>
        <option value="2d">2D</option>
        <option value="3d">3D</option>
      </select>

      {dim === "1d" && (
        <div>
          <label>Kernel: </label>
          <input
            type="number"
            value={data.kernel ?? 2}
            onChange={(e) => handleChange(e, "kernel")}
            style={{ width: 50 }}
          />

          <label>Stride: </label>
          <input
            type="number"
            value={data.stride ?? 1}
            onChange={(e) => handleChange(e, "stride")}
            style={{ width: 50 }}
          />
        </div>
      )}

      {dim === "2d" && (
        <div>
          <label>KH: </label>
          <input
            type="number"
            value={data.kernelH ?? 2}
            onChange={(e) => handleChange(e, "kernelH")}
            style={{ width: 50 }}
          />

          <label>KW: </label>
          <input
            type="number"
            value={data.kernelW ?? 2}
            onChange={(e) => handleChange(e, "kernelW")}
            style={{ width: 50 }}
          />

          <label>SH: </label>
          <input
            type="number"
            value={data.strideH ?? 1}
            onChange={(e) => handleChange(e, "strideH")}
            style={{ width: 50 }}
          />

          <label>SW: </label>
          <input
            type="number"
            value={data.strideW ?? 1}
            onChange={(e) => handleChange(e, "strideW")}
            style={{ width: 50 }}
          />
        </div>
      )}
      {dim === "3d" && (
        <div>
            <label>KD: </label>
            <input 
                type="number" 
                value={data.kernelD ?? 2} onChange={(e) => handleChange(e, "kernelD")} 
                style={{width:50}} />
            <label>KH: </label>
            <input 
                type="number" 
                value={data.kernelH ?? 2} onChange={(e) => handleChange(e, "kernelH")} 
                style={{width:50}} />
            <label>KW: </label>
            <input 
                type="number" 
                value={data.kernelW ?? 2} onChange={(e) => handleChange(e, "kernelW")} 
                style={{width:50}} />
            <label>SD: </label>
            <input 
                type="number" 
                value={data.strideD ?? 1} onChange={(e) => handleChange(e, "strideD")} 
                style={{width:50}} />
            <label>SH: </label>
            <input 
                type="number" 
                value={data.strideH ?? 1} onChange={(e) => handleChange(e, "strideH")} 
                style={{width:50}} />
            <label>SW: </label>
            <input 
                type="number" 
                value={data.strideW ?? 1} onChange={(e) => handleChange(e, "strideW")} 
                style={{width:50}} />
        </div>
        )}

    </div>
  );
}
export default AvgPool;

import React from 'react';
import { Handle, Position } from 'reactflow';

function LinearNode({ data, id, setNodes }) {
  const handleChange = (e, field) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, [field]: value } };
        }
        return node;
      })
    );
  };

  return (
    <div
      style={{
        padding: 5,
        border: '1px solid black',
        borderRadius: 3,
        backgroundColor: 'white',
        minWidth: 100,
        minHeight: 40,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: 'black' }}
      />
      <h4 style={{ margin: 0 }}>{data.label}</h4>
      <div>
        <label>In: </label>
        <input
          type="number"
          value={data.inFeatures}
          onChange={(e) => handleChange(e, 'inFeatures')}
          style={{ width: 50 }}
        />
      </div>
      <div>
        <label>Out: </label>
        <input
          type="number"
          value={data.outFeatures}
          onChange={(e) => handleChange(e, 'outFeatures')}
          style={{ width: 50 }}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: 'black' }}
      />
    </div>
  );
}
export default LinearNode;

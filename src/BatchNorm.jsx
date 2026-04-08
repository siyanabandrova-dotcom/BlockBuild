import React, {useState} from 'react';
import { Handle, Position } from 'reactflow';

function BatchNorm({ data, id, setNodes }){
    const [open, setOpen] = useState(false)

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
        <div style={{

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
                //position: 'flex',
            }}>

                <div style={{ fontWeight: 700 }}>
                    BatchNorm
                </div>

                <div>
                <label>Num Features: </label>
                <input
                type="number"
                value={data.numFeatures}
                onChange={(e) => handleChange(e, 'numFeatures')}
                style={{ width: 50 }}
                />
            </div>

                <Handle type="target" position={Position.Top} />
                <Handle type="source" position={Position.Bottom} />

        </div>
     )
}
export default BatchNorm;
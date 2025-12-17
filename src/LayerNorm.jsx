import React  from "react";
import { Handle, Position } from "reactflow";

function LayerNorm({ data, id, setNodes}){
    const handleChange = (e) =>{
        const value=parseInt(e.target.value, 10)
        if (isNaN(value) || value<=0) return;

        setNodes((nds) =>
            nds.map((node) =>{
                if(node.id===id){
                    return {...node, data: {...node.data, normalizedShape: value}};
                }
                return node;
            })
        )
    };
    return (
        <div
            style={{
                padding: 5,
                border: "1px solid black",
                borderRadius: 3,
                backgroundColor: "white",
                minWidth: 100,
                minHeight: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
            }}>
            <Handle type="target" position={Position.Top} id="in" style={{ background: "black" }} />
            <Handle type="source" position={Position.Bottom} id="out" style={{ background: "black" }} />
            <h4 style={{margin: 0}}> LayerNorm </h4>
            <div>
                <label> Normalized Shape: </label>
                <input
                    type="number"
                    value={data.normalizedShape ?? 1}
                    onChange={handleChange}
                    style={{width: 50}}
                />
            </div>
                
        </div>
    )
};
export default LayerNorm
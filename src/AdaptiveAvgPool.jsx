import React, {useState} from "react";
import {Handle, Position} from "reactflow";

function AdaptiveAvgPool({id, data, setNodes}){
    const [dim, setDim] = useState(data.dim ?? "1d");

    const handleDimChange = (newDim) =>{
        setDim(newDim);
        setNodes((nds) => 
            nds.map((node) =>{
                if(node.id===id){
                    return {
                        ...node,
                        data:{...node.data, dim: newDim}
                    }
                }
                return node;
            })
        );
    };

    const handleChange = (e, field) =>{
        const value=parseInt(e.target.value, 10)
        if(isNaN(value) || value<=0) return;

        setNodes((nds) =>
            nds.map((node) =>{
                if(node.id === id) {
                    return { 
                        ...node, 
                        data: { ...node.data, [field]: value } 
                    };
                }
                return node;
            })
        );
    };

    return(
        <div style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid black",
            background: "white",
            width: 220
            }}>

            <Handle type="target" position={Position.Top} id="in"/>
            <Handle type="source" position={Position.Bottom} id="out"/>

            <h4 style={{margin: 0}}> AdaptiveAvgPool </h4>
            
            <select value={dim} onChange={(e) => handleDimChange(e.target.value)}>
                <option value="1d">1D</option>
                <option value="2d">2D</option>
            </select>

            {dim=="1d" && (
                <div>
                    <label>Output Size: </label>
                    <input
                        type="number"
                        value={data.outputSize ?? 1}
                        onChange={(e) => handleChange(e, "outputSize")}
                        style={{width: 50}}
                    />
                </div>
            )}
            {dim === "2d" && (
                <div>
                <label>Output H: </label>
                <input
                    type="number"
                    value={data.outputH ?? 1}
                    onChange={(e) => handleChange(e, "outputH")}
                    style={{ width: 50 }}
                />
                <label>Output W: </label>
                <input
                    type="number"
                    value={data.outputW ?? 1}
                    onChange={(e) => handleChange(e, "outputW")}
                    style={{ width: 50 }}
                />
                </div>
            )}
        </div>
    )
}
export default AdaptiveAvgPool;
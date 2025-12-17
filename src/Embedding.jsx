import React from "react";
import { Handle, Position } from "reactflow";
import Dropout from "./Dropout";
function Embedding({ data, id, setNodes}){
    const handleChange = (e) =>{
        const value = parseInt(e.target, 10);
        if(isNaN(value) || value<=0) return;

        setNodes((nds) => 
            nds.map((node) =>{
                if(node.id===id){
                    return {...node, data: {...node.data, embeddingDim: value}};
                }
                return node;
            })
        );
    };

    return(
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
            <h4 style={{margin: 0}}> Embedding </h4>
            <div>
                <label> Embedding Dim: </label>
                <input
                    type="number"
                    value={data.Embedding}
                    onChange={handleChange}
                    style={{width: 50}}
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="out" style={{backgroundColor: "black"}} />
        </div>
    );
}
export default Embedding;
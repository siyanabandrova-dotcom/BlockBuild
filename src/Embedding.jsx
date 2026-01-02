import React from "react";
import { Handle, Position } from "reactflow";
import Dropout from "./Dropout";
function Embedding({ data, id, setNodes}){
    const handleChange = (e) =>{
        const field = e.target.name;
        const value = parseInt(e.target.value, 10);
        if(isNaN(value) || value<=0) return;

        setNodes((nds) => 
            nds.map((node) =>{
                if(node.id===id){
                    return {...node, data: {...node.data, [field]: value}};
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
                    name="embeddingDim"
                    value={data.embeddingDim}
                    onChange={handleChange}
                    style={{width: 50}}
                />
            </div>
            <div>
                <label> Num embeddings: </label>
                <input
                    type="number"
                    name="numEmbeddings"
                    value={data.numEmbeddings}
                    onChange={handleChange}
                    style={{width: 50}}
                />
            </div>
            <Handle type="source" position={Position.Bottom} id="out" style={{backgroundColor: "black"}} />
        </div>
    );
}
export default Embedding;

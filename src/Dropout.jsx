import React from "react"
import {Handle, Position} from "reactflow";

function Dropout({data, id, setNodes}){
    const handleChange = (e) => {
        const value=parseFloat(e.target.value);
        if(isNaN(value) || value<0 || value>1) return;

        setNodes((nds) =>
            nds.map((node) =>{
                if(node.id==id){
                    return {...node, data: {...node.data, p: value}}
                }
                return node;
            })
        )
    }

    return(
        <div
            style={{
                padding: 5,
                border: "1px solid black",
                borderRadius: 3,
                backgroundColor: "white",
                minWidth: 100,
                minHeight: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative"
            }}>
            <Handle
                type="target"
                position={Position.Top}
                id="in"
                style={{background: "black"}}
            />

            <h4 style={{margin: 0}}> Dropout </h4>

            <div>
                <label> Probability: </label>
                <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={data.p ?? 0.5}
                    onChange={handleChange}
                    style={{width: 50}}

                />
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="out"
                style={{ background: "black" }}
            />
        </div>
    )
};
export default Dropout;
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import { useState, useEffect } from "react";

export default function ConcatNode ({id, data, setNodes}){
    const count = data.inputsCount ?? 2;

    const handleChange = (e) =>{
        const value = parseInt(e.target.value, 10);
        if(isNaN(value) || value <= 0) return;

        setNodes((nds) => 
            nds.map((node) => {
                if(node.id == id){
                    return{
                        ...node,
                        data:{
                            ...node.data,
                            inputsCount: value,
                        },
                    };
                }
                return node;
            })
        );
    };

    const PORT_SPACING = 20;
    const BASE_WIDHT = 80;

    const nodeWidth = Math.max(BASE_WIDHT, count * PORT_SPACING + 20)

    return (
        <div
      style={{
        padding: 5,
        border: '1px solid black',
        borderRadius: 3,
        backgroundColor: 'white',
        minHeight: 40,
        width: nodeWidth,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
        <div style = {{fontWeight: 'bold'}}> Concat </div>
            {Array.from({length: count}).map((_, i) =>(
                <Handle
                    key = {i}
                    type = "target"
                    position = {Position.Top}
                    id = {`in-${i}`}
                    style = {{left: 20 + i * 20}}
                />
            ))}   
            <Handle
                type="source"
                position={Position.Bottom}
                id="out"
            /> 

            <div>
                <label>Ports: </label>
                <input
                type="number"
                value={data.inputsCount}
                onChange={handleChange}
                style={{ width: 50 }}
                />
            </div>
        </div>
    )
}
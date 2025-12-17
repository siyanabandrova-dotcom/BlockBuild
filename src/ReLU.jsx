import React from "react"
import {Handle, Position} from "reactflow"
function ReLU(){
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
                position={Position.top}
                id="in"
                style={{background:"black"}}
            />
            <h4 style={{ margin: 0 }}>ReLU</h4>
            <Handle
                type="source"
                position={Position.Bottom}
                id="out"
                style={{ background: 'black' }}
            />
        </div>
    )
}
export default ReLU;
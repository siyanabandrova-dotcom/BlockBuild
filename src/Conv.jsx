import React from "react"
import { Handle, Position } from "reactflow"

function ConvNode({data}){
    const dimLabel = (data.convType ?? data.dim ?? "conv1d").toUpperCase();
    return (
        <div style={{
            padding: "10px",
            border: "1px solid black",
            borderRadius: "6px",
            backgroundColor: "white",
            width: "140px",
            textAlign: "center",
            }}>
            <Handle type="target" position={Position.Top} id="in" style={{ background: "black" }} />
            <div style={{ fontWeight: "bold" }}>Conv ({dimLabel})</div>
            <div>Kernel: {data?.kernelSize ?? "-"}</div>
            <div>In: {data?.inChannels ?? "-"}</div>
            <div>Out: {data?.outChannels ?? "-"}</div>
            <Handle type="source" position={Position.Bottom} id="out" style={{ background: "black" }} />
        </div>
    );
}
export default ConvNode;
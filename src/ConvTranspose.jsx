import React from "react"
import {Position, Handle} from "reactflow"
export default function ConvTransposeNode({ data, id, setNodes }){
    const update = (field, value) => {
        setNodes(nds =>
            nds.map(n =>
                n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n
            )
        );
    };

    return (
        <div style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid black",
            background: "white",
            width: 220
        }}>
            <h4 style={{margin: 0, marginBottom: 8}}> ConvTranspose </h4>
            <label> In Channels: </label>
            <input
                type="number"
                value={data.inChannels}
                onChange={(e) => update("inChannels", +e.target.value)}
            />
            <label> Out Channels: </label>
            <input
                type="number"
                value={data.outChannels}
                onChange={(e) => update("outChannels", +e.target.value)}
            />

            {data.mode=="1d" && (
                <>
                    <label> Kernel Size: </label>
                    <input
                        type="number"
                        value={data.kernelSize}
                        onChange={(e) => update("kernelSize", +e.target.value)}
                    />
                    <label> Stride: </label>
                    <input
                        type="number"
                        value={data.stride}
                        onChange={(e) => update("stride", +e.target.value)}
                    />
                </>
            )}

            {data.mode === "2d" && (
                <>
                <label>Kernel (H x W):</label>
                <input 
                    type="number" 
                    value={data.kernelH}
                    onChange={(e) => update("kernelH", +e.target.value)} />
                
                <input 
                    type="number" 
                    value={data.kernelW}
                    onChange={(e) => update("kernelW", +e.target.value)} />

                <label>Stride (H x W):</label>
                <input 
                    type="number" 
                    value={data.strideH}
                    onChange={(e) => update("strideH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.strideW}
                    onChange={(e) => update("strideW", +e.target.value)} />
                </>
            )}
        
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />

        </div>
    )
}
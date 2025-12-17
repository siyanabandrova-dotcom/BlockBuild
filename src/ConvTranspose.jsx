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
            <h4 style={{margin: 0, marginBottom: 8}}>ConvTranspose </h4>
            <label>Mode: </label>
            <select
                value={data.mode}
                onChange={(e) => update("mode", e.target.value)}>
                <option value="1d"> 1D </option>
                <option value="2d"> 2D </option>
            </select>
            <label> In Channels: </label>
            <input
                type="number"
                value={data.inChannel}
                onChange={(e) => update("inChannel", +e.target.value)}
            />
            <label> Out Channels: </label>
            <input
                type="number"
                value={data.outChannel}
                onChange={(e) => update("outChannel", +e.target.value)}
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
                    <label> Padding: </label>
                    <input
                        type="number"
                        value={data.padding}
                        onChange={(e) => update("padding", +e.target.value)}
                    />
                    <label> OutputPadding: </label>
                    <input
                        type="number"
                        value={data.outputpadding}
                        onChange={(e) => update("outputpadding", +e.target.value)}
                    />
                    <label> Length: </label>
                    <input
                        type="number"
                        value={data.length}
                        onChange={(e) => update("length", +e.target.value)}
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

                <label>Padding (H x W):</label>
                <input 
                    type="number" 
                    value={data.padH}
                    onChange={(e) => update("padH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.padW}
                    onChange={(e) => update("padW", +e.target.value)} />

                <label>Output Padding (H x W):</label>
                <input 
                    type="number" 
                    value={data.outPadH}
                    onChange={(e) => update("outPadH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.outPadW}
                    onChange={(e) => update("outPadW", +e.target.value)} />

                <label>Input (H x W):</label>
                <input 
                    type="number" 
                    value={data.inH}
                    onChange={(e) => update("inH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.inW}
                    onChange={(e) => update("inW", +e.target.value)} />
                </>
            )}
        
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />

        </div>
    )
}
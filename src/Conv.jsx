import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";

function Conv({ id, data, setNodes, edges }) {
    const [dim, setDim] = useState(data.dim ?? "1d");
    const [inChannels, setInChannels] = useState(data.inChannels ?? 1);
    const [outChannels, setOutChannels] = useState(data.outChannels ?? 1);
    const [kernelSize, setKernelSize] = useState(data.kernelSize ?? 3);
    const [kernelH, setKernelH] = useState(data.kernelH ?? 3);
    const [kernelW, setKernelW] = useState(data.kernelW ?? 3);
    const [kernelD, setKernelD] = useState(data.kernelD ?? 3);

    // Когато някое поле се променя, update-ва всички свързани нодове
    const updateNode = (newFields) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newFields } };
                }
                return node;
            })
        );

        if ("outChannels" in newFields) {
            const nextIds = edges.filter((e) => e.source === id).map((e) => e.target);
            setNodes((nds) =>
                nds.map((node) => {
                    if (nextIds.includes(node.id)) {
                        return {
                            ...node,
                            data: { ...node.data, inChannels: newFields.outChannels },
                        };
                    }
                    return node;
                })
            );
        }
    };

    // Handlers за input
    const handleDimChange = (e) => {
        const newDim = e.target.value;
        setDim(newDim);
        updateNode({ dim: newDim });
    };

    const handleInChannels = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) return;
        setInChannels(val);
        updateNode({ inChannels: val });
    };

    const handleOutChannels = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) return;
        setOutChannels(val);
        updateNode({ outChannels: val });
    };

    const handleKernelSize = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) return;
        setKernelSize(val);
        updateNode({ kernelSize: val });
    };

    const handleKernelH = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) return;
        setKernelH(val);
        updateNode({ kernelH: val });
    };

    const handleKernelW = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) return;
        setKernelW(val);
        updateNode({ kernelW: val });
    };

    const handleKernelD = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) return;
        setKernelD(val);
        updateNode({ kernelD: val });
    };

    return (
        <div
            style={{
                padding: 5,
                border: "1px solid black",
                borderRadius: 3,
                backgroundColor: "white",
                minWidth: 140,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
            }}
        >
            <Handle type="target" position={Position.Top} id="in" />
            <Handle type="source" position={Position.Bottom} id="out" />

            <h4 style={{ margin: 0 }}>Conv ({dim})</h4>
            <select value={dim} onChange={handleDimChange}>
                <option value="1d">1D</option>
                <option value="2d">2D</option>
                <option value="3d">3D</option>
            </select>

            <div>
                <label>In: </label>
                <input type="number" value={inChannels} onChange={handleInChannels} style={{ width: 50 }} />
                <label>Out: </label>
                <input type="number" value={outChannels} onChange={handleOutChannels} style={{ width: 50 }} />
            </div>

            {dim === "1d" && (
                <div>
                    <label>Kernel: </label>
                    <input type="number" value={kernelSize} onChange={handleKernelSize} style={{ width: 50 }} />
                </div>
            )}

            {dim === "2d" && (
                <div>
                    <label>KH: </label>
                    <input type="number" value={kernelH} onChange={handleKernelH} style={{ width: 50 }} />
                    <label>KW: </label>
                    <input type="number" value={kernelW} onChange={handleKernelW} style={{ width: 50 }} />
                </div>
            )}

            {dim === "3d" && (
                <div>
                    <label>KD: </label>
                    <input type="number" value={kernelD} onChange={handleKernelD} style={{ width: 50 }} />
                    <label>KH: </label>
                    <input type="number" value={kernelH} onChange={handleKernelH} style={{ width: 50 }} />
                    <label>KW: </label>
                    <input type="number" value={kernelW} onChange={handleKernelW} style={{ width: 50 }} />
                </div>
            )}
        </div>
    );
}

export default Conv;

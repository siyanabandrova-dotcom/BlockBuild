import React from "react";
import { Handle, Position } from "reactflow";

export default function LayerNode({ id, data, setNodes }) {
    console.log("LayerNode render", { id, data});
    const { type } = data;
    const params = data;
    
    const outputSize = data.outputSize
    console.log("LayerNode render", { id, data, outputSize});

    const handleChange = (key, value) => {
        setNodes((prev) =>{
            const updated = prev.map((node) =>{
                if(node.id === id){
                    return {
                    ...node,
                    data: {
                        ...node.data,
                        [key]: value 
                    }
                };
                }
                return node;
            });
            return updated;
        });
    }
    return (
        <div
            style={{
                padding: "10px",
                background: "white",
                borderRadius: "8px",
                border: "1px solid black",
                minWidth: "180px",
                textAlign: "center",
            }}
        >
            <strong style={{ textTransform: "uppercase" }}>
                {type}
            </strong>

            {/* Conv */}
            {["conv1d"].includes(type) && (
                <>
                    
                    <div>
                        <label>In Channels: </label>
                        <input
                            value={params.inChannels || ""}
                            onChange={(e) => handleChange("inChannels", e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Out Channels: </label>
                        <input
                            value={params.outChannels || ""}
                            onChange={(e) => handleChange("outChannels", e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label>Kernel Size: </label>
                        <input
                            value={params.kernelSize || ""}
                            onChange={(e) => handleChange("kernelSize", e.target.value)}
                        />
                    </div>
                    <div>
                        <label> Stride: </label>
                        <input
                            value={params.stride || ""}
                            onChange={(e) => handleChange("stride", e.target.value)}
                        />
                    </div>
                    <div>
                        <label> Padding: </label>
                        <input
                            value={params.padding || ""}
                            onChange={(e) => handleChange("padding", e.target.value)}
                        />
                    </div>
                </>
            )}
            {["conv2d"].includes(type) && (
                <>
                    <div>
                        <label>In Channels: </label>
                        <input
                            value={params.in || ""}
                            onChange={(e) => handleChange("in", e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Out Channels: </label>
                        <input
                            value={params.out || ""}
                            onChange={(e) => handleChange("out", e.target.value)}
                        />
                    </div>
                    <div>
                        <label>KH:  </label>
                        <input
                            value={params.kernelH || ""}
                            onChange={(e) => handleChange("kernelH", e.target.value)}
                        />
                        <label>KW:  </label>
                        <input
                            value={params.kernelW || ""}
                            onChange={(e) => handleChange("kernelW", e.target.value)}
                        />
                    </div>
                    <div>
                        <label> SH: </label>
                        <input
                            value={params.strideH || ""}
                            onChange={(e) => handleChange("strideH", e.target.value)}
                        />
                        <label> SW: </label>
                        <input
                            value={params.strideW || ""}
                            onChange={(e) => handleChange("strideW", e.target.value)}
                        />
                    </div>
                    <div>
                        <label> PH: </label>
                        <input
                            value={params.padH || ""}
                            onChange={(e) => handleChange("padH", e.target.value)}
                        />
                        <label> PW: </label>
                        <input
                            value={params.padW || ""}
                            onChange={(e) => handleChange("padW", e.target.value)}
                        />
                    </div>
                </>
            )}

            {["conv3d"].includes(type) && (
                <>
                    <div>
                        <label>In Channels: </label>
                        <input
                            value={params.inChannels || ""}
                            onChange={(e) => handleChange("in", e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Out Channels: </label>
                        <input
                            value={params.outChannels || ""}
                            onChange={(e) => handleChange("out", e.target.value)}
                        />
                    </div>
                    <div>
                        <label>KD:  </label>
                        <input
                            value={params.kernelD || ""}
                            onChange={(e) => handleChange("kernelD", e.target.value)}
                        />
                        <label>KH:  </label>
                        <input
                            value={params.kernelH || ""}
                            onChange={(e) => handleChange("kernelH", e.target.value)}
                        />
                        <label>KW:  </label>
                        <input
                            value={params.kernelW || ""}
                            onChange={(e) => handleChange("kernelW", e.target.value)}
                        />
                    </div>
                    <div>
                        <label> SD: </label>
                        <input
                            value={params.strideD || ""}
                            onChange={(e) => handleChange("strideD", e.target.value)}
                        />
                        <label> SH: </label>
                        <input
                            value={params.strideH || ""}
                            onChange={(e) => handleChange("strideH", e.target.value)}
                        />
                        <label> SW: </label>
                        <input
                            value={params.strideW || ""}
                            onChange={(e) => handleChange("strideW", e.target.value)}
                        />
                    </div>
                    <div>
                        <label> PD: </label>
                        <input
                            value={params.padD || ""}
                            onChange={(e) => handleChange("padD", e.target.value)}
                        />
                        <label> PH: </label>
                        <input
                            value={params.padH || ""}
                            onChange={(e) => handleChange("padH", e.target.value)}
                        />
                        <label> PW: </label>
                        <input
                            value={params.padW || ""}
                            onChange={(e) => handleChange("padW", e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* AvgPool 1D */}
            {["avgpool1d"].includes(type) && (
                <>
                    <div>
                        <label>Kernel: </label>
                        <input
                            value={params.kernel || ""}
                            onChange={(e) => handleChange("kernel", e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Stride: </label>
                        <input
                            value={params.stride || ""}
                            onChange={(e) => handleChange("stride", e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* AvgPool 2D */}
            {["avgpool2d"].includes(type) && (
                <>
                    <div>
                        <label>KH: </label>
                        <input
                            type="number"
                            value={params.kernelH ?? 2}
                            onChange={(e) => handleChange("kernelH", Number(e.target.value))}
                            style={{ width: 50 }}
                        />
                    </div>
                    <div>
                        <label>KW: </label>
                        <input
                            type="number"
                            value={params.kernelW ?? 2}
                            onChange={(e) => handleChange("kernelW", Number(e.target.value))}
                            style={{ width: 50 }}
                        />
                    </div>
                    <div>
                        <label>SH: </label>
                        <input
                            type="number"
                            value={params.strideH ?? 1}
                            onChange={(e) => handleChange("strideH", Number(e.target.value))}
                            style={{ width: 50 }}
                        />
                    </div>
                    <div>
                        <label>SW: </label>
                        <input
                            type="number"
                            value={params.strideW ?? 1}
                            onChange={(e) => handleChange("strideW", Number(e.target.value))}
                            style={{ width: 50 }}
                        />
                    </div>
                    
                </>
            )}

            {/* AvgPool 3D */}
            {["avgpool3d"].includes(type) && (
                <>
                    <label>KD: </label>
                    <input
                        type="number"
                        value={params.kernelD ?? 2}
                        onChange={(e) => handleChange("kernelD", Number(e.target.value))}
                        style={{ width: 50 }}
                    />

                    <label>KH: </label>
                    <input
                        type="number"
                        value={params.kernelH ?? 2}
                        onChange={(e) => handleChange("kernelH", Number(e.target.value))}
                        style={{ width: 50 }}
                    />

                    <label>KW: </label>
                    <input
                        type="number"
                        value={params.kernelW ?? 2}
                        onChange={(e) => handleChange("kernelW", Number(e.target.value))}
                        style={{ width: 50 }}
                    />

                    <label>SD: </label>
                    <input
                        type="number"
                        value={params.strideD ?? 1}
                        onChange={(e) => handleChange("strideD", Number(e.target.value))}
                        style={{ width: 50 }}
                    />

                    <label>SH: </label>
                    <input
                        type="number"
                        value={params.strideH ?? 1}
                        onChange={(e) => handleChange("strideH", Number(e.target.value))}
                        style={{ width: 50 }}
                    />

                    <label>SW: </label>
                    <input
                        type="number"
                        value={params.strideW ?? 1}
                        onChange={(e) => handleChange("strideW", Number(e.target.value))}
                        style={{ width: 50 }}
                    />
                </>
            )}

            {/*AdaptiveAvgPool*/}
            {["adaptiveavgpool1d"].includes(type)  && (
                <div>
                    <label>Output Size: </label>
                    <input
                        type="number"
                        value={data.outputSize ?? 1}
                        onChange={(e) => handleChange("outputSize", +e.target.value)}
                        style={{width: 50}}
                    />
                </div>
            )}
            {["adaptiveavgpool2d"].includes(type) && (
                <div>
                <label>Output H: </label>
                <input
                    type="number"
                    value={data.outputH ?? 1}
                    onChange={(e) => handleChange("outputH", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>Output W: </label>
                <input
                    type="number"
                    value={data.outputW ?? 1}
                    onChange={(e) => handleChange("outputW", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
            )}

            {/* ConvTranspose Layer */}
            {["convtranspose1d"].includes(type) && (
                <>
                    <div>
                    <label> In Channels: </label>
                    <input
                        type="number"
                        value={data.inChannels}
                        onChange={(e) => handleChange("inChannels", +e.target.value)}
                    />
                    </div>
                    <div>
                    <label> Out Channels: </label>
                    <input
                        type="number"
                        value={data.outChannels}
                        onChange={(e) => handleChange("outChannels", +e.target.value)}
                    />
                    </div>
                    <div>
                    <label> Kernel Size: </label>
                    <input
                        type="number"
                        value={data.kernelSize}
                        onChange={(e) => handleChange("kernelSize", +e.target.value)}
                    />
                    </div>
                    <div>
                    <label> Stride: </label>
                    <input
                        type="number"
                        value={data.stride}
                        onChange={(e) => handleChange("stride", +e.target.value)}
                    />
                    </div>
                    <div>
                    <label> Padding: </label>
                    <input
                        type="number"
                        value={data.padding}
                        onChange={(e) => handleChange("padding", +e.target.value)}
                    />
                    </div>
                    
                </>
            )}

            {["convtranspose2d"].includes(type) && (
                <>
                <div>
                <label> In Channels: </label>
                <input
                    type="number"
                    value={data.inChannels}
                    onChange={(e) => handleChange("inChannels", +e.target.value)}
                />
                </div>
                <div>
                <label> Out Channels: </label>
                <input
                    type="number"
                    value={data.outChannels}
                    onChange={(e) => handleChange("outChannels", +e.target.value)}
                />
                </div>
                <div>
                <label>Kernel (H x W):</label>
                <input 
                    type="number" 
                    value={data.kernelH}
                    onChange={(e) => handleChange("kernelH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.kernelW}
                    onChange={(e) => handleChange("kernelW", +e.target.value)} />
                </div>
                <div>
                <label>Stride (H x W):</label>
                <input 
                    type="number" 
                    value={data.strideH}
                    onChange={(e) => handleChange("strideH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.strideW}
                    onChange={(e) => handleChange("strideW", +e.target.value)} />
                </div>
                <div>
                <label>Padding (H x W):</label>
                <input 
                    type="number" 
                    value={data.padH}
                    onChange={(e) => handleChange("padH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.padW}
                    onChange={(e) => handleChange("padW", +e.target.value)} />
                </div>
                </>
            )}

            {/* MaxPool */}
            {["maxpool1d"].includes(type) && (
                <>
                <div>
                <label>Kernel: </label>
                <input
                    type="number"
                    value={data.kernel ?? 2}
                    onChange={(e) => handleChange("kernel", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
                <div>
                <label>Stride: </label>
                <input
                    type="number"
                    value={data.stride ?? 1}
                    onChange={(e) => handleChange("stride", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
                </>
                
            )}
            {["maxpool2d"].includes(type) && (
                <>
                <div>
                <label>KH: </label>
                <input
                    type="number"
                    value={data.kernelH ?? 2}
                    onChange={(e) => handleChange("kernelH", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>KW: </label>
                <input
                    type="number"
                    value={data.kernelW ?? 2}
                    onChange={(e) => handleChange("kernelW", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
                <div>
                <label>SH: </label>
                <input
                    type="number"
                    value={data.strideH ?? 1}
                    onChange={(e) => handleChange("strideH", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>SW: </label>
                <input
                    type="number"
                    value={data.strideW ?? 1}
                    onChange={(e) => handleChange("strideW", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
                </>
            )}

            {["maxpool3d"].includes(type) && (
                <>
                <div>
                <label>KD: </label>
                <input
                    type="number"
                    value={data.kernelD ?? 2}
                    onChange={(e) => handleChange("kernelD", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>KH: </label>
                <input
                    type="number"
                    value={data.kernelH ?? 2}
                    onChange={(e) => handleChange("kernelH", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>KW: </label>
                <input
                    type="number"
                    value={data.kernelW ?? 2}
                    onChange={(e) => handleChange("kernelW", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
                <div>
                <label>SD: </label>
                <input
                    type="number"
                    value={data.strideD ?? 1}
                    onChange={(e) => handleChange("strideD", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>SH: </label>
                <input
                    type="number"
                    value={data.strideH ?? 1}
                    onChange={(e) => handleChange("strideH", +e.target.value)}
                    style={{ width: 50 }}
                />
                <label>SW: </label>
                <input
                    type="number"
                    value={data.strideW ?? 1}
                    onChange={(e) => handleChange("strideW", +e.target.value)}
                    style={{ width: 50 }}
                />
                </div>
                </>
            )}

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

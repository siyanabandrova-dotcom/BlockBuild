import React from "react";
import { Handle, Position } from "reactflow";

export default function LayerNode({ id, data }) {
    const { type, params = {}, updateNodeData } = data;

    const handleChange = (key, value) => {
        updateNodeData(id, {
            params: {
                ...params,
                [key]: value
            }
        });
    };

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
            {["conv1d", "conv2d", "conv3d"].includes(type) && (
                <>
                    <div>
                        <label>Kernel: </label>
                        <input
                            value={params.kernel || ""}
                            onChange={(e) => handleChange("kernel", e.target.value)}
                        />
                    </div>

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
                        onChange={(e) => handleChange(e, "outputSize")}
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
                    onChange={(e) => handleChange(e, "outputH")}
                    style={{ width: 50 }}
                />
                <label>Output W: </label>
                <input
                    type="number"
                    value={data.outputW ?? 1}
                    onChange={(e) => handleChange(e, "outputW")}
                    style={{ width: 50 }}
                />
                </div>
            )}

            {/* ConvTranspose Layer */}
            {["convtranspose1d"].includes(type) && (
                <>
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
                    <div>
                    <label> OutputPadding: </label>
                    <input
                        type="number"
                        value={data.outputpadding}
                        onChange={(e) => handleChange("outputpadding", +e.target.value)}
                    />  
                    </div>
                    <div>
                    <label> Length: </label>
                    <input
                        type="number"
                        value={data.length}
                        onChange={(e) => handleChange("length", +e.target.value)}
                    /> 
                    </div>
                    
                </>
            )}

            {["convtranspose2d"].includes(type) && (
                <>
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
                <div>
                <label>Output Padding (H x W):</label>
                <input 
                    type="number" 
                    value={data.outPadH}
                    onChange={(e) => handleChange("outPadH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.outPadW}
                    onChange={(e) => handleChange("outPadW", +e.target.value)} />
                </div>
                
                <div>
                <label>Input (H x W):</label>
                <input 
                    type="number" 
                    value={data.inH}
                    onChange={(e) => handleChange("inH", +e.target.value)} />
                <input 
                    type="number" 
                    value={data.inW}
                    onChange={(e) => handleChange("inW", +e.target.value)} />
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
                    onChange={(e) => handleChange(e, "kernel")}
                    style={{ width: 50 }}
                />
                </div>
                <div>
                <label>Stride: </label>
                <input
                    type="number"
                    value={data.stride ?? 1}
                    onChange={(e) => handleChange(e, "stride")}
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
                    onChange={(e) => handleChange(e, "kernelH")}
                    style={{ width: 50 }}
                />
                <label>KW: </label>
                <input
                    type="number"
                    value={data.kernelW ?? 2}
                    onChange={(e) => handleChange(e, "kernelW")}
                    style={{ width: 50 }}
                />
                </div>
                <div>
                <label>SH: </label>
                <input
                    type="number"
                    value={data.strideH ?? 1}
                    onChange={(e) => handleChange(e, "strideH")}
                    style={{ width: 50 }}
                />
                <label>SW: </label>
                <input
                    type="number"
                    value={data.strideW ?? 1}
                    onChange={(e) => handleChange(e, "strideW")}
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
                    onChange={(e) => handleChange(e, "kernelD")}
                    style={{ width: 50 }}
                />
                <label>KH: </label>
                <input
                    type="number"
                    value={data.kernelH ?? 2}
                    onChange={(e) => handleChange(e, "kernelH")}
                    style={{ width: 50 }}
                />
                <label>KW: </label>
                <input
                    type="number"
                    value={data.kernelW ?? 2}
                    onChange={(e) => handleChange(e, "kernelW")}
                    style={{ width: 50 }}
                />
                </div>
                <div>
                <label>SD: </label>
                <input
                    type="number"
                    value={data.strideD ?? 1}
                    onChange={(e) => handleChange(e, "strideD")}
                    style={{ width: 50 }}
                />
                <label>SH: </label>
                <input
                    type="number"
                    value={data.strideH ?? 1}
                    onChange={(e) => handleChange(e, "strideH")}
                    style={{ width: 50 }}
                />
                <label>SW: </label>
                <input
                    type="number"
                    value={data.strideW ?? 1}
                    onChange={(e) => handleChange(e, "strideW")}
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

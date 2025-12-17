import React, { useState, useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls
} from "reactflow";
import "reactflow/dist/style.css";
import LinearNode from "./LinearNode.jsx"; 
import ReLU from "./ReLU.jsx";            
import Dropout from "./Dropout.jsx";
import LayerNorm from './LayerNorm.jsx';
import Embedding from './Embedding.jsx';
import AddConvButton from "./AddConvButton.jsx";
import ConvNode from "./Conv.jsx";
import ConvTransposeNode from "./ConvTranspose.jsx";
import AddConvTransposeButton from './AddConvTransposeButton.jsx';
import AvgPool from "./AvgPool.jsx";
import AddAvgPoolButton from './AddAvgPoolButton.jsx';
import MaxPool from './MaxPool.jsx';
import AddMaxPoolButton from "./AddMaxPoolButton.jsx";
import AdaptiveAvgPool from "./AdaptiveAvgPool.jsx";
import AddAdaptivePoolButton from "./AddAdaptiveAvgPoolButton.jsx";

const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;

const trashX = 1250;
const trashY = 600;
const trashWidth = 150;
const trashHeight = 150;

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [output, setOutput] = useState(null);
  const [epochs, setEpochs] = useState(20);

  const nodeTypes = React.useMemo(() => ({
    linear: (props) => <LinearNode {...props} setNodes={setNodes} />,
    relu: (props) => <ReLU {...props} />,
    dropout: (props) => <Dropout {...props} setNodes={setNodes} />,
    layernorm: (props) => <LayerNorm {...props} setNodes={setNodes} />,
    embedding: (props) => <Embedding {...props} setNodes={setNodes} />,
    conv: (props) => <ConvNode {...props} setNodes={setNodes} />,
    convtranspose: (props) => <ConvTransposeNode {...props} setNodes={setNodes}/>,
    avgpool: (props) => <AvgPool {...props} setNodes={setNodes} />,
    maxpool: (props) => <MaxPool {...props} setNodes={setNodes} />,
    adaptiveavgpool: (props) => <AdaptiveAvgPool {...props} setNodes={setNodes} />,
  }), [setNodes]);

  const handleAddLinear = () => {
    const newNode = {
      id: crypto.randomUUID(),
      type: "linear",
      position: { x: 200, y: 200 },
      data: { label: "Linear", type: "linear", inFeatures: 16, outFeatures: 16 },
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddReLU = () => {
    const newNode = {
      id: crypto.randomUUID(),
      type: "relu",
      position: { x: 200, y: 200 },
      data: { label: "ReLU", type: "relu" },
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddDropout = () => {
    const newNode = {
      id: crypto.randomUUID(),
      type: "dropout",
      position: {x: 200, y: 200},
      data: {
        label: "Dropout",
        type: "dropout",
        p: 0.5
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT 
    };
    setNodes((nds) => [...nds, newNode])
  }

  const handleAddLayerNorm = () => {
    const newNode = {
      id: crypto.randomUUID(),
      type: "layernorm",
      position: {x: 200, y: 200},
      data: {
        label: "LayerNorm",
        type: "layernorm",
        normalizedShape: 16 // default 
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddEmbedding = () =>{
    const newNode ={
      id: crypto.randomUUID(),
      type: "embedding",
      position: {x: 200, y: 200},
      data: {
        label: "Embedding",
        type: "embedding",
        numEmbeddings: 100,
        embeddingDim: 16, // default
        seqLen: 1,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddConv = (convType) => {
    const dim=convType === "conv1d" ? "1d" : convType === "conv2d" ? "2d" : "3d";
    const newNode = {
      id: crypto.randomUUID(),
      type: "conv",
      position: {x: 200, y: 200},
      data: {
        label: "Conv",
        type: "conv",
        dim,
        inChannels: 1,
        outChannels: 32,
        kernelSize: 3,
        stride: 1,
        padding: 0,

        kernelH: 3,
        kernelW: 3,
        strideH: 1,
        strideW: 1,
        padH: 0,
        padW: 0,
        kernelD: 3,
        strideD: 1,
        padD: 0, 
        },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleAddConvTranspose = (convtransposeType) => {
     const newNode = {
      id: crypto.randomUUID(),
      type: "convtranspose",
      position: { x: 200, y: 200 },
      data: {
        label: "ConvTranspose",
        type: "convtranspose",
        mode: convtransposeType === "convtranspose1d" ? "1d" : "2d",
        kernelH: 3, kernelW: 3,
        strideH: 1, strideW: 1,
        padH: 0, padW: 0,
        outPadH: 0, outPadW: 0,
        inH: 28, inW: 28
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddAvgPool = (dimType) =>{
    const newNode = {
      id: crypto.randomUUID(),
      type: "avgpool",
      position: {x: 200, y: 200},
      data: {
        label: "AvgPool",
        type: "avgpool",
        dim: dimType,
        kernel: 2,
        stride: 2,
        padding: 0
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    }
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddMaxPool = (maxpoolType) =>{
    let dim = "1d";
    if (maxpoolType === "maxpool2d") dim = "2d";
    if (maxpoolType === "maxpool3d") dim = "3d";
    const newNode = {
      id: crypto.randomUUID(),
      type: "maxpool",
      position: {x: 200, y: 200},
      data: {
        label: "MaxPool",
        type: "maxpool",
        dim: dim,
        kernel: 2,
        stride: 1,
        kernelH: 2,
        kernelW: 2,
        strideH: 1,
        strideW: 1,
        kernelD: 2,
        strideD: 1,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    }
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddAdaptiveAvgPool = (type) =>{
    const newNode = {
      id: crypto.randomUUID(),
      type: "adaptiveavgpool",
      position: {x: 200, y: 200},
      data:{
        label: "AdaptiveAvgPool",
        dim: type === "adaptiveavgpool1d" ? "1d" : "2d",
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const getOutputDim = (node) => {
    if (!node || !node.data) return null;

    if (node.type === "linear" && node.data.outFeatures != null) return node.data.outFeatures;
    if ((node.type === "conv" || node.type === "convtranspose") && node.data.outChannels != null) return node.data.outChannels;
    if (node.type === "embedding" && node.data.embeddingDim != null) return node.data.embeddingDim;
    if (node.type === "layernorm" && node.data.normalizedShape != null) return node.data.normalizedShape;

    return null;  
  };
  const canConnect = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode) return false;

    const s = sourceNode.data ?? {};
    const t = targetNode.data ?? {};

    if (targetNode.type === "conv" && t.dim === "1d" && sourceNode.type === "linear") {
      return (t.inChannels ?? null) === (s.outFeatures ?? null);
    }

    if (targetNode.type === "linear" || targetNode.type === "layernorm") {
      const sourceOut = s.outFeatures ?? s.embeddingDim ?? s.outChannels ?? null;
      const targetIn  = t.inFeatures ?? t.normalizedShape ?? null;
      if (sourceOut == null || targetIn == null) return true;
      return sourceOut === targetIn;
    }

    if (targetNode.type === "relu" || targetNode.type === "dropout") return true;

  return true;
};
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if(canConnect(sourceNode, targetNode)){
        setEdges((eds) => addEdge(params, eds));
      }else{
        alert(`Cannot connect ${sourceNode.data.type} → ${targetNode.data.type}`);
      }
    },
    [nodes]
  );


  const handleNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const handleEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);


  const trashRef=useRef(null)
  const onNodeDragStop = useCallback(
    (evt, node) => {
      const rect = trashRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = evt.clientX;
      const y = evt.clientY;

      const insideTrash = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (insideTrash) {
        setNodes((nds) => nds.filter((n) => n.id !== node.id));
        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
      }
    },
    [setNodes, setEdges]
  );


  const handleRunModel = async () => {
    const payload = {
      epochs,
      nodes: nodes.map((n) => {
        const d = n.data ?? {}; 

        return {
          id: n.id,
          type: d.type ?? n.type,

          // Linear
          inFeatures: d.inFeatures ?? null,
          outFeatures: d.outFeatures ?? null,

          // Dropout
          p: d.p ?? null,

          // LayerNorm
          normalizedShape: d.normalizedShape ?? null,

          // Embedding
          numEmbeddings: d.numEmbeddings ?? null,
          embeddingDim: d.embeddingDim ?? null,
          seqLen: d.seqLen ?? 1,

          // Conv
          dim: d.dim ?? null,
          inChannels: d.inChannels ?? null,
          outChannels: d.outChannels ?? null,
          kernelSize: d.kernelSize ?? null,
          stride: d.stride ?? null,
          padding: d.padding ?? null,

          kernelH: d.kernelH ?? null,
          kernelW: d.kernelW ?? null,
          strideH: d.strideH ?? null,
          strideW: d.strideW ?? null,
          padH: d.padH ?? null,
          padW: d.padW ?? null,

          kernelD: d.kernelD ?? null,
          strideD: d.strideD ?? null,
          padD: d.padD ?? null,

          // Pool
          kernel: d.kernel ?? null,
          poolKernelH: d.kernelH ?? null,
          poolKernelW: d.kernelW ?? null,
          poolStrideH: d.strideH ?? null,
          poolStrideW: d.strideW ?? null,
        };
      }),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    };

    console.log("Run payload:", payload);

    try {
      const res=await fetch("http://localhost:8000/run_model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors"
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Response is not JSON:", text);
        throw new Error("Invalid JSON");
      }

      const outputValue = {
        output: data.output ?? data.outputs ?? null,
        loss: data.loss ?? null,
        loss_history: data.loss_history ?? null,
        error: data.error ?? null,
      };
      setOutput(outputValue);
    } catch (err) {
      console.error("Run error:", err);
      setOutput({ error: String(err) });
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Lenta */}
      <div style={{padding: 10, background: "black", color: "white", display: "flex", gap: 10}}>
        <button onClick={handleAddLinear}>➕ Add Linear</button>
        <button onClick={handleAddReLU}>➕ Add ReLU</button>
        <button onClick={handleAddDropout}>➕ Add Dropout </button>
        <button onClick={handleAddLayerNorm}>➕ Add LayerNorm</button>
        <button onClick={handleAddEmbedding}>➕  Add Embedding</button>
        <AddConvButton onAddNode={handleAddConv}/>
        <AddConvTransposeButton onAddNode={handleAddConvTranspose}/>
        <AddAvgPoolButton onAddNode={handleAddAvgPool}/>
        <AddMaxPoolButton onAddNode={handleAddMaxPool}/>
        <AddAdaptivePoolButton onAddNode={handleAddAdaptiveAvgPool}/>
        <button onClick={handleRunModel}>🚀 Run model</button>
        <label style={{ display: "flex", alignItems: "center", gap: 5, color: "white"}}>
          Epochs: 
          <input
            type="number"
            min={1}
            max={1000}
            value={epochs}
            onChange={(e) => setEpochs(Number(e.target.value))}
            style={{width: 70}}
            />
        </label>

        {output && (
          <div
            style={{
              position: "absolute",
              top: 100,
              right: 20,
              width: 300,
              maxHeight: 400,
              overflowY: "auto",
              background: "black",
              padding: "10px",
              border: "1px solid black",
              borderRadius: 5,
              zIndex: 1000,
              boxShadow: "0 0 10px rgba(0,0,0,0.3)"
            }}
          >
            {/*<strong>Model output:</strong>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {JSON.stringify(output, null, 2)}
            </pre>*/}

            {Array.isArray(output?.output) && (
              <>
                <strong>Model output:</strong>
                <div style={{ whiteSpace: "pre-line" }}>
                  {output.output.map((row, i) =>
                    Array.isArray(row) ? row.join("\n") : row
                  )}
                </div>
              </>
            )}


            {"loss" in output && (
              <>
                <strong>Loss:</strong>
                <div>{output.loss}</div>
              </>
            )}

            {Array.isArray(output.loss_history) && (
              <>
                <hr style={{ borderColor: "#333" }} />
                <strong>Loss history:</strong>
                <div style={{fontSize: 12, marginTop: 6}}>
                  {output.loss_history.map((val, idx) =>
                    <div key={idx}>
                      epoch: {idx+1} : {val};
                    </div>
                  )}
                </div>
                {/*<pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                  {JSON.stringify(output.loss_history, null, 2)}
                </pre>*/}
              </>
            )}
          </div>
        )}
      </div>

      {/* Trash */}
      <div ref={trashRef}
        style={{
          position: "absolute",
          left: trashX,
          top: trashY,
          width: trashWidth,
          height: trashHeight,
          background: "rgba(255,0,0,0.2)",
          border: "2px dashed red",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        🗑️ Drag here to delete
      </div>

      {/* Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

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
import ConvNode from "./Conv.jsx";
import ConvTransposeNode from "./ConvTranspose.jsx";
import AvgPool from "./AvgPool.jsx";
import MaxPool from './MaxPool.jsx';
import AdaptiveAvgPool from "./AdaptiveAvgPool.jsx";
import AddLayerButton from "./AddLayerButton.jsx";
import LayerNode from "./LayerNode";
import TrainingDataInput from "./TrainingDataInput.jsx";
import { parseSample, validateAllSamples } from "./parseSample.jsx";


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
  const [learningRate, setLearningRate] = useState(0.01);
  const [inputValue, setInputValue] = useState("");
  const [expectedValue, setExpectedValue] = useState("");

  const [trainingSamples, setTrainingSamples] = useState([]);
  const [testInput, setTestInput] = useState("");
  const [trainStatus, setTrainingStatus] = useState("");
  //const [trainOutput, setTrainOutput] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [testOutput, setTestOutput] = useState("");



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
    layer: LayerNode,
  }), [setNodes]);

  const onAddNode = (type) => {
    const newNode = {
      id: `${Date.now()}`,
      type: "layer",
      position: { x: 200, y: 200 },
      data: { 
        type,
        params: {},
        updateNodeData: (id, patch) => {
          setNodes(prev =>
            prev.map(n =>
              n.id === id
                ? { ...n, data: { ...n.data, ...patch } }
                : n
            )
          );
        }
      },
    };

    setNodes((prev) => [...prev, newNode]);
  };
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

    const sdim=getOutputDim(s)
    const tdim=getOutputDim(t)

    if(targetNode.type === "embedding") return false;

    if(tdim!=sdim) return false;

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

  const appendToConsole = (msg) => {
    setConsoleOutput(prev => Array.isArray(prev) ? [...prev, msg] : [msg]);
  }

  const handleDatasetSubmit = ({inputs, outputs}) =>{
    const samples = inputs.map((inp, i) =>({
      input: {data: inp},
      output: {data: outputs[i]},
    }));

    //setTrainingSamples(prev => [...prev, ...samples]);
    setTrainingSamples(samples);
    setTrainingStatus("Dataset loaded successfully!")
  };
  
  // Train
  const handleTrain = async () =>{
    if (!trainingSamples || trainingSamples.length === 0) {
      setTrainingStatus("No training samples loaded!");
      return;
    }
    //setTrainOutput(null);
    setConsoleOutput([]);
    
    setTrainingStatus("Training...");
    
    const payload ={
      nodes: nodes.map(n =>({
        id: n.id,
        type: n.data.type ?? n.type,
        ...n.data
      })),
      epochs,
      learningRate,
      edges: edges.map(e => ({ source: e.source, target: e.target })),
      training: trainingSamples,
    };
    
    try{
      const res = await fetch("http://localhost:8000/train", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });
      
      if(!res.ok){
        const txt = await res.text();
        console.log("SERVER ERROR:", txt);
        setTrainingStatus("Training failed!");
        return;
      }
      
      const data= await res.json();
      
      setConsoleOutput(data);
      
      console.log("TRAIN OUTPUT:", consoleOutput);
      console.log("OUTPUT LENGTH:", consoleOutput?.output?.length);

      appendToConsole("TRAINING OUTPUT");
      setTrainingStatus(data.message || "Training completed!");
      if(data.output){
        appendToConsole(
          //"Model output:\n" + data.output.map((o, i) => `Sample ${i+1}: ${o[0]}`).join("\n")
          "Model output:\n" + data.output.map((o, i) => `Sample ${i}: ${o.join(", ")}`).join("\n")
        );
      }

    if(data.loss!==undefined){
      appendToConsole(`Loss: ${data.loss}`);
    }

    if(Array.isArray(data.loss_history)){
      appendToConsole("Loss history: ");
      data.loss_history.forEach((v, i) =>
        appendToConsole(`Epoch ${i+1}: ${v}`)
      )
    }
    } catch (err) {
      console.error(err);
      setTrainingStatus("Training failed! (network error)");
    }
  }

  // Single test
  const handleRun = async () =>{
    try{
      const parsedTest=parseSample(testInput);

      if(!parsedTest || !parsedTest.data){
        throw new Error("Parsed test input is invalid.");
      }

      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ input: parsedTest}),
      })

      const data=await res.json();
      setTestOutput(JSON.stringify(data.output));
      appendToConsole("TEST OUTPUT");
      //appendToConsole("Input: " + JSON.stringify(parsedTest.data));
      appendToConsole(`Input: ${parsedTest.data}`);
      //appendToConsole("Output: " + JSON.stringify(data.output));
      appendToConsole(`Output: ${data.output}`);

      setTestOutput(JSON.stringify(data.output));
      
    }catch(err) {
      setTestOutput("Error: "+err.message);    
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Lenta */}
      <div 
        style={{
          padding: "10px",
          background: "black", 
          color: "white", 
          display: "flex", 
          gap: 10,
          borderRadius: "8px",
          border: "0px solid black",
          minWidth: "180px",
          minHeigth: "20px",
          //textAlign: "center",
        }}>
        <button onClick={handleAddLinear}>➕ Add Linear</button>
        <button onClick={handleAddReLU}>➕ Add ReLU</button>
        <button onClick={handleAddDropout}>➕ Add Dropout </button>
        <button onClick={handleAddLayerNorm}>➕ Add LayerNorm</button>
        <button onClick={handleAddEmbedding}>➕  Add Embedding</button>
      
        {/*<AddConvButton onAddNode={handleAddConv}/>*/}
        <AddLayerButton
          label="Add Convolution Layer"
          options={[
            {label: "Conv1D", value: "conv1d"},
            {label: "Conv2D", value: "conv2d"},
            {label: "Conv3D", value: "conv3d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>
        {/*<AddConvTransposeButton onAddNode={handleAddConvTranspose}/>*/}
        <AddLayerButton
          label="Add ConvTranspose Layer"
          options={[
            {label: "ConvTranspose1D", value: "convtranspose1d"},
            {label: "ConvTranspose2D", value: "convtranspose2d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>
        <AddLayerButton
          label="Add AvgPooling Layer"
          options={[
            {label: "AvgPool1D", value: "avgpool1d"},
            {label: "AvgPool2D", value: "avgpool2d"},
            {label: "AvgPool3D", value: "avdpool3d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>
        {/*<AddAvgPoolButton onAddNode={handleAddAvgPool}/>
        <AddMaxPoolButton onAddNode={handleAddMaxPool}/>*/}
        <AddLayerButton
          label="Add MaxPooling Layer"
          options={[
            {label: "MaxPool1D", value: "maxpool1d"},
            {label: "MaxPool2D", value: "maxpool2d"},
            {label: "MaxPool3D", value: "maxpool3d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>
        {/*<AddAdaptivePoolButton onAddNode={handleAddAdaptiveAvgPool}/>*/}
        <AddLayerButton
          label="Add AdaptiveAvgPooling Layer"
          options={[
            {label: "AdaptiveAvgPool1D", value: "adaptiveavgpool1d"},
            {label: "AdaptiveAvgPool2D", value: "adaptiveavgpool2d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>

        {/* Test panel 
        <div 
          style={{
            position: "absolute",
            top: 100,
            left: 10,
            width: 300,
            padding: 16,
            background: "#72ce4eff",
            //background: "#ce4e4eff",
            color: "white",
            border: "1px solid #333",
            borderRadius: 8,
            zIndex: 2000
          }}>
            <h3 style={{marginTop: 0}}> Test </h3>

            <label>Input: </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: "80%",
                marginBottom: 10,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #555",
                background: "#ffffffff",
                color: "black",
              }}
            />

            <label>Output:</label>
            <input
              type="text"
              //readOnly
              value={expectedValue}
              onChange={(e) => setExpectedValue(e.target.value)}
              style={{
                width: "80%",
                marginBottom: 12,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #555",
                background: "#ffffffff",
                color: "black",
              }}
            />

        </div> */}

        {/* Training and Testing*/}
        <div style={{
            position: "absolute",
            top: 90,
            left: 10,
            width: 300,
            padding: 16,
            background: "#72ce4eff",
            //background: "#ce4e4eff",
            color: "white",
            border: "1px solid #333",
            borderRadius: 8,
            zIndex: 2000,
            minHeight: "200px",
          }}>

          <h3> Training </h3>
          <TrainingDataInput onDataReady={handleDatasetSubmit} />
          <button onClick={handleTrain}> Train </button>
          <p>{trainStatus}</p>

          <h3> Testing </h3>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            style={{width: "300px", height: "80px"}}
            rows={3}
            placeholder="Enter test input"
          />
          <button onClick={handleRun}>Run</button>
          {/*<h3>Output:</h3>
          <pre>{testOutput}</pre>*/}
        </div>

        {/*<button onClick={handleRunModel}>🚀 Run Model </button>*/}
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

        <label style={{ display: "flex", alignItems: "center", gap: 5, color: "white"}}>
          Learning rate: 
          <input
            type="number"
            max={100}
            value={learningRate}
            onChange={(e) => setLearningRate(Number(e.target.value))}
            style={{width: 70}}
            />
        </label>

        {consoleOutput.length>0 && (
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
            <div>
              {Array.isArray(consoleOutput.output) && (
                <>
                  <strong>Model output:</strong>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {consoleOutput.output.map((row, i) =>
                        <div key={i}>
                          <strong>Sample {i}:</strong>
                          <pre>{Array.isArray(row) ? row[0] : row}</pre>
                        </div>

                    )}
                  </div>
                </>
              )}

              {"loss" in consoleOutput && (
                <>
                  <strong>Loss:</strong>
                  <div>{consoleOutput.loss}</div>
                </>
              )}

              {Array.isArray(consoleOutput?.loss_history) && (
              <>
                <hr style={{ borderColor: "#333" }} />
                <strong>Loss history:</strong>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  {consoleOutput.loss_history.map((val, idx) => (
                    <div key={idx}>
                      epoch: {idx + 1} : {val};
                    </div>
                  ))}
                </div>
              </>)}
            </div>
          </div>
        )}
      </div>

      {consoleOutput.length>0 && (
        <div style={{
          position: "absolute",
          top: 100,
          right: 20,
          width: 350,
          maxHeight: 500,
          overflowY: "auto",
          background: "black",
          color: "white",
          padding: 10,
          border: "1px solid #333",
          borderRadius: 5,
          zIndex: 1000
        }}>
          {consoleOutput.map((c,i) => (
            <div key={i} style={{whiteSpace: "pre-wrap", marginBottom: 10}}>
              {c}
            </div>
          ))}
        </div>

      )}


      
      {/* Trash */}
      <div ref={trashRef}
        style={{
          position: "absolute",
          left: trashX,
          top: trashY,
          width: trashWidth,
          height: trashHeight,
          background: "rgba(232, 35, 35, 0.2)",
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
  )
}


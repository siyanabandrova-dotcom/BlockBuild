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
import LayerNode from "./LayerNode.jsx";
import TrainingDataInput from "./TrainingDataInput.jsx";
import { parseSample, validateAllSamples } from "./parseSample.jsx";
import ConcatNode from "./ConcatNode.jsx";
import Softmax from "./Softmax.jsx";
import MatMulNode from "./MatMulNode.jsx";
import ScaleNode from "./ScaleNode.jsx";
import MaskNode from "./MaskNode.jsx";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;

const trashX = 1250;
const trashY = 600;
const trashWidth = 150;
const trashHeight = 150;

export default function Workspace() {
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
  const [inputSource, setInputSource] = useState("manual");
  const [batchSize, setBatchSize] = useState(64);
  const [noiseLevel, setNoiseLevel] = useState(0.0);
  const [dataset, setDataset] = useState("mnist");
  
  const location = useLocation();
  const preset = location.state?.preset;

  const nodeTypes = React.useMemo(() => ({
    linear: (props) => <LinearNode {...props} setNodes={setNodes} />,
    relu: (props) => <ReLU {...props} />,
    dropout: (props) => <Dropout {...props} setNodes={setNodes} />,
    layernorm: (props) => <LayerNorm {...props} setNodes={setNodes} />,
    embedding: (props) => <Embedding {...props} setNodes={setNodes} />,
    //conv: (props) => <ConvNode {...props} setNodes={setNodes} />,
    //conv1d: (props) => <ConvNode {...props} setNodes={setNodes} />,
    //conv2d: (props) => <ConvNode {...props} setNodes={setNodes} />,
    //conv3d: (props) => <ConvNode {...props} setNodes={setNodes} />,
    //convtranspose: (props) => <ConvTransposeNode {...props} setNodes={setNodes}/>,
    //convtranspose1d: (props) => <ConvTransposeNode {...props} setNodes={setNodes}/>,
    //convtranspose2d: (props) => <ConvTransposeNode {...props} setNodes={setNodes}/>,
    //avgpool: (props) => <AvgPool {...props} setNodes={setNodes} />,
    //avgpool1d: (props) => <AvgPool {...props} setNodes={setNodes} />,
    //avgpool2d: (props) => <AvgPool {...props} setNodes={setNodes} />,
    //avgpool3d: (props) => <AvgPool {...props} setNodes={setNodes} />,
   // maxpool: (props) => <MaxPool {...props} setNodes={setNodes} />,
    //maxpool1d: (props) => <MaxPool {...props} setNodes={setNodes} />,
    //maxpool2d: (props) => <MaxPool {...props} setNodes={setNodes} />,
    //maxpool3d: (props) => <MaxPool {...props} setNodes={setNodes} />,
    //adaptiveavgpool: (props) => <AdaptiveAvgPool {...props} setNodes={setNodes} />,
    adaptiveavgpool1d: (props) => <AdaptiveAvgPool {...props} setNodes={setNodes} />,
    adaptiveavgpool2d: (props) => <AdaptiveAvgPool {...props} setNodes={setNodes} />,
    adaptiveavgpool3d: (props) => <AdaptiveAvgPool {...props} setNodes={setNodes} />,
    layer: (props) => <LayerNode {...props} setNodes={setNodes} />,
    concat:(props) => <ConcatNode {...props} setNodes={setNodes} />,
    softmax: (props) => <Softmax {...props} setNodes={setNodes} />,
    matmul: (props) => <MatMulNode {...props} setNodes={setNodes}/>,
    scale: (props) => <ScaleNode {...props} setNodes={setNodes}/>,
    mask: (props) => <MaskNode {...props} setNodes={setNodes}/>,
  }), [setNodes]);


const loadMnistPreset = () => {
  setDataset("mnist");
  setEpochs(10);
  setLearningRate(0.01);

  setNodes([
    {
      id: "1",
      type: "layer",
      position: { x: 100, y: 100 },
      data: {
        type: "conv2d",
        inChannels: 1,
        outChannels: 6,
        kernelH: 5,
        kernelW: 5,
        strideH: 1,
        strideW: 1,
        padH: 0,
        padW: 0
      }
    },

    {
      id: "2",
      type: "relu",
      position: { x: 100, y: 300 },
      data: {}
    },

    {
      id: "3",
      type: "layer",
      position: { x: 100, y: 400 },
      data: {
        type: "avgpool2d",
        kernelH: 2,
        kernelW: 2,
        strideH: 2,
        strideW: 2
      }
    },

    {
      id: "4",
      type: "layer",
      position: { x: 100, y: 600 },
      data: {
        type: "conv2d",
        inChannels: 6,
        outChannels: 16,
        kernelH: 5,
        kernelW: 5,
        strideH: 1,
        strideW: 1,
        padH: 0,
        padW: 0
      }
    },

    {
      id: "5",
      type: "relu",
      position: { x: 100, y: 800 },
      data: {}
    },

    {
      id: "6",
      type: "layer",
      position: { x: 100, y: 900 },
      data: {
        type: "avgpool2d",
        kernelH: 2,
        kernelW: 2,
        strideH: 2,
        strideW: 2
      }
    },

    {
      id: "7",
      type: "linear",
      position: { x: 100, y: 1100 },
      data: {
        inFeatures: 256,
        outFeatures: 120
      }
    },

    {
      id: "8",
      type: "linear",
      position: { x: 100, y: 1200 },
      data: {
        inFeatures: 120,
        outFeatures: 10
      }
    }
  ]);

  setEdges([
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
    { id: "e5-6", source: "5", target: "6" },
    { id: "e6-7", source: "6", target: "7" },
    { id: "e7-8", source: "7", target: "8" },
  ]);
};

const loadFashionMnistPreset = () => {
  setDataset("fashion");
  setEpochs(15);
  setLearningRate(0.001);

  setNodes([
    {
      id: "1",
      type: "layer",
      position: { x: 100, y: 100 },
      data: {
        type: "conv2d",
        inChannels: 1,
        outChannels: 32,
        kernelH: 3,
        kernelW: 3,
        strideH: 1,
        strideW: 1,
        padH: 1,
        padW: 1
      }
    },
    {
      id: "2",
      type: "relu",
      position: { x: 100, y: 300 },
      data: {}
    },
    {
      id: "3",
      type: "layer",
      position: { x: 100, y: 400 },
      data: {
        type: "conv2d",
        inChannels: 32,
        outChannels: 64,
        kernelH: 3,
        kernelW: 3,
        strideH: 1,
        strideW: 1,
        padH: 1,
        padW: 1
      }
    },
    {
      id: "4",
      type: "relu",
      position: { x: 100, y: 600 },
      data: {}
    },
    {
      id: "5",
      type: "layer",
      position: { x: 100, y: 700 },
      data: {
        type: "maxpool2d",
        kernelH: 2,
        kernelW: 2,
        strideH: 2,
        strideW: 2
      }
    },
    {
      id: "6",
      type: "layer",
      position: { x: 100, y: 800 },
      data: {
        type: "conv2d",
        inChannels: 64,
        outChannels: 128,
        kernelH: 3,
        kernelW: 3,
        strideH: 1,
        strideW: 1,
        padH: 1,
        padW: 1
      }
    },
    {
      id: "7",
      type: "relu",
      position: { x: 100, y: 1000 },
      data: {}
    },
    {
      id: "8",
      type: "layer",
      position: { x: 100, y: 1100 },
      data: {
        type: "maxpool2d",
        kernelH: 2,
        kernelW: 2,
        strideH: 2,
        strideW: 2
      }
    },
    {
      id: "9",
      type: "linear",
      position: { x: 100, y: 1200 },
      data: {
        inFeatures: 6272,
        outFeatures: 128
      }
    },
    {
      id: "10",
      type: "linear",
      position: { x: 100, y: 1300 },
      data: {
        inFeatures: 128,
        outFeatures: 10
      }
    }
  ]);

  setEdges([
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
    { id: "e5-6", source: "5", target: "6" },
    { id: "e6-7", source: "6", target: "7" },
    { id: "e7-8", source: "7", target: "8" },
    { id: "e8-9", source: "8", target: "9" },
    { id: "e9-10", source: "9", target: "10" }
  ]);
};

const loadForexPreset = () => {
  //setDataset("Forex");
  setEpochs(1000);
  setLearningRate(0.001);

  setNodes([
    {
      id: "1",
      type: "layernorm",
      position: { x: 100, y: 100 },
      data: { normalizedShape: 11 }
    },
    {
      id: "2",
      type: "linear",
      position: { x: 100, y: 200 },
      data: { inFeatures: 11, outFeatures: 16 }
    },
    {
      id: "3",
      type: "relu",
      position: { x: 100, y: 300 },
      data: {}
    },
    {
      id: "4",
      type: "linear",
      position: { x: 100, y: 400 },
      data: { inFeatures: 16, outFeatures: 8 }
    },
    {
      id: "5",
      type: "relu",
      position: { x: 100, y: 500 },
      data: {}
    },
    {
      id: "6",
      type: "linear",
      position: { x: 100, y: 600 },
      data: { inFeatures: 8, outFeatures: 1 }
    }
  ]);

  setEdges([
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
    { id: "e5-6", source: "5", target: "6" },
  ]);
};

const loadHousingPreset = () => {
  setEpochs(400);
  setLearningRate(0.01);

  setNodes([
    {
      id: "1",
      type: "layernorm",
      position: { x: 100, y: 50 },
      data: { inFeatures: 4, outFeatures: 16 }
    },
    {
      id: "2",
      type: "linear",
      position: { x: 100, y: 150 },
      data: { inFeatures: 4, outFeatures: 16 }
    },
    {
      id: "3",
      type: "relu",
      position: { x: 100, y: 250 },
      data: {}
    },
    {
      id: "4",
      type: "linear",
      position: { x: 100, y: 350 },
      data: { inFeatures: 16, outFeatures: 16 }
    },
    {
      id: "5",
      type: "relu",
      position: { x: 100, y: 450 },
      data: {}
    },
    {
      id: "6",
      type: "linear",
      position: { x: 100, y: 550 },
      data: { inFeatures: 16, outFeatures: 1 }
    }
  ]);

  setEdges([
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
    { id: "e5-6", source: "5", target: "6" },
  ]);
};

useEffect(() => {
    if(!preset) return;

    if(preset == "mnist"){
      loadMnistPreset();
    }
    if(preset == "fashion"){
      loadFashionMnistPreset();
    }
    if(preset == "forex"){
      loadForexPreset();
    }
    if(preset == "housing"){
      loadHousingPreset();
    }
  }, [preset]);

  const onAddNode = (type) => {
    let defaultData = {}
    if(type == "conv1d"){
      defaultData = {
        inChannels: 1,
        outChannels: 1,
        kernelSize: 3,
        stride: 1,
        padding: 0,
      };
    }
    if(type == "conv2d"){
      defaultData = {
        inChannels: 1,
        outChannels: 1,
        kernelH: 3,
        kernelW: 3,
        strideH: 1,
        strideW: 1,
        padH: 0,
        padW: 0,
      };
    }
    if(type == "conv3d"){
      defaultData = {
        inChannels: 1,
        outChannels: 1,
        kernelD: 3,
        kernelH: 3,
        kernelW: 3,
        strideD: 1,
        strideH: 1,
        strideW: 1,
        padD: 0,
        padH: 0,
        padW: 0,
      };
    }
    if (type === "convtranspose1d") {
      defaultData = {
        dim: "1d",
        inChannels: 1,
        outChannels: 1,
        kernelSize: 3,
        stride: 1,
      };
    }
    if (type === "convtranspose2d") {
      defaultData = {
        dim: "2d",
        inChannels: 1,
        outChannels: 1,
        kernelH: 3,
        kernelW: 3,
        strideH: 1,
        strideW: 1,
      };
    }
    if(type === "avgpool1d"){
      defaultData = {
        kernel: 2,
        stride: 2,
      };
    }
    if(type === "avgpool2d"){
      defaultData = {
        kernelH: 2,
        kernelW: 2,
        strideH: 2,
        strideW: 2,
      };
    }
    if(type == "avgpool3d"){
      defaultData = {
        kernelD: 2,
        kernelH: 2,
        kernelW: 2,
        strideD: 2,
        strideH: 2,
        strideW: 2,
      };
    }
    if(type == "maxpool1d"){
      defaultData = {
        kernel: 2,
        stride: 2,
      };
    }
    if (type === "maxpool2d") {
      defaultData = {
        kernelH: 2,
        kernelW: 2,
        strideH: 2,
        strideW: 2,
      };
    }
    if (type === "maxpool3d") {
      defaultData = {
        kernelD: 2,
        kernelH: 2,
        kernelW: 2,
        strideD: 2,
        strideH: 2,
        strideW: 2,
      };
    }
    if (type === "adaptiveavgpool1d") {
      defaultData = {
        outputSize: 1,
      };
    }
    if (type === "adaptiveavgpool2d") {
      defaultData = {
        outputSize: 1,
      };
    }

  const newNode = {
      id: `${Date.now()}`,
      type: "layer",
      position: { x: 200, y: 200 },
      data: { 
        type: type,
        ...defaultData,
        updateNodeData: (id, patch) => {
        setNodes(prev =>
          prev.map(n => {
            if (n.id === id) {
              return { ...n, data: { ...n.data, ...patch } };
            }
            return n;
          })
        );
      }

        //params: {},
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

  const updateConcatDate = (id, newData) =>{
    setNodes((nds) =>
      nds.map((node) => 
        node.id == id
        ? {...node, data: {...node.data, ...newData}}
        : node
      ) 
    );
  };
  
  const handleAddConcatNode = () =>{
    const newNode ={
      id: crypto.randomUUID(),
      type: "concat",
      position: {x: 200, y: 200},
      data: {
        label: "Concat",
        type: "concat",
        inputsCount: 2,
        onChange: updateConcatDate,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddSoftmaxNode = () =>{
    const newNode = {
      id: crypto.randomUUID(),
      type: "softmax",
      position: {x: 200, y: 200},
      data: {
        label: "Softmax",
        type: "softmax",
        softmaxDim: 2,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddMatMulNode = () =>{
    const newNode = {
      id: crypto.randomUUID(),
      type: "matmul",
      position: {x: 200, y: 200},
      data: {
        label: "MatMul",
        type: "matmul",
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddScaleNode = () =>{
    const newNode = {
      id: crypto.randomUUID(),
      type: "scale",
      position: {x: 200, y: 200},
      data:{
        label: "Scale",
        type: "scale",
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
    setNodes((nds) => [...nds, newNode]);
  }

  const handleAddMaskNode = () =>{
    const newNode = {
      id: crypto.randomUUID(),
      type: "mask",
      position: {x: 200, y: 200},
      data:{
        label: "Mask",
        type: "mask"
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

  //const API_URL = "https://blockbuild-fvhs.onrender.com";
  //const API_URL = "https://blockbuild-ai-u4d8.onrender.com";
  //const API_URL = "http://localhost:8000/run";
  const API_URL = "https://blockbuild-ai-u4d8.onrender.com"

  
  // Train
  const handleTrain = async () =>{
    console.log("NODES BEFORE BACKEND:", nodes);
    if(inputSource == "manual"){
      if (!trainingSamples || trainingSamples.length === 0) {
        setTrainingStatus("No training samples loaded!");
        return;
      }
      //setTrainOutput(null);
      setConsoleOutput([]);
      
      setTrainingStatus("Training...");
      
      const payload ={

        inputSource,
        nodes: nodes.map(n => {
            const safeType = n.data?.type
                ? n.data.type
                : (n.type === "layer" ? null : n.type);

            if (!safeType) {
                console.error("❗ Node missing data.type → FIX THIS NODE:", n);
            }

            return {
                id: n.id,
                type: safeType,
                ...n.data
            };
        }),
        epochs,
        learningRate,
        edges: edges.map(e => ({ source: e.source, target: e.target })),
        training: trainingSamples,
        //noiseLevel: noiseLevel,
        };
        try{
        const res = await fetch("https://blockbuild-ai-u4d8.onrender.com/train"/* `${API_URL}/train`*/, {
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
    if(inputSource === "dataset"){
      try{
        setTrainingStatus("Training on MNIST...");
        setConsoleOutput([]);

        const payload = {
          inputSource: "dataset",
          nodes: nodes.map(n => {
              const safeType = n.data?.type
                  ? n.data.type
                  : (n.type === "layer" ? null : n.type);

              if (!safeType) {
                  console.error("❗ Node missing data.type → FIX THIS NODE:", n);
              }

              return {
                  id: n.id,
                  type: safeType,
                  ...n.data
              };
          }),
          edges: edges.map(e => ({ source: e.source, target: e.target })),
          epochs,
          learningRate,
          batchSize,
          datasetName: dataset,
          //noiseLevel: noiseLevel,
        }
        // http://localhost:8000
        const res = await fetch("https://blockbuild-ai-u4d8.onrender.com/train_dataset"/* "http://localhost:8000/train_dataset"*/, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        setConsoleOutput(data);
        /*if(data.output){
          appendToConsole(
            //"Model output:\n" + data.output.map((o, i) => `Sample ${i+1}: ${o[0]}`).join("\n")
            "Model output:\n" + data.output.map((o, i) => `Sample ${i}: ${o.join(", ")}`).join("\n")
          );
        }*/

        appendToConsole("TRAINING OUTPUT");

        appendToConsole(
        `Accuracy: ${(data.accuracy * 100).toFixed(2)}%`
        );

        appendToConsole(
          `Correct: ${data.correct} / ${data.total}`
        );

        if(Array.isArray(data.samples)){
          data.samples.forEach((s, i) =>{
            appendToConsole(
              `Sample ${i}: true=${s.true}, pred=${s.pred}`
            );
          });
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
        setTrainingStatus('MNIST training completed.');
      } catch(err){
        console.error("NETWORK ERROR:", err);
        setTrainingStatus("Training failed! (network error)");
      }

    }
  
  }

 // Single test
  const handleRun = async () =>{
    if(inputSource == "manual"){
      console.log("🔥 handleRun called");
      try{
        const parsedTest=parseSample(testInput);

        if(!parsedTest || !parsedTest.data){
          throw new Error("Parsed test input is invalid.");
        }

        const res = await fetch("https://blockbuild-ai-u4d8.onrender.com/run"/* `${API_URL}/run`*/, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            input: parsedTest.data,
          }),
        })
        //console.log("RAW RESPONSE:", data);

        const data=await res.json();
        setTestOutput(JSON.stringify(data.output));
        appendToConsole("TEST OUTPUT");
        
        //appendToConsole("Input: " + JSON.stringify(parsedTest.data));
        appendToConsole("Input: " + parsedTest.data.join(", "));

        appendToConsole("Output: " + JSON.stringify(data.output));
        //appendToConsole("Output: " + data.output.join(", "));
        //appendToConsole("Input: " + JSON.stringify(parsedTest.data));
        //appendToConsole(`Input: ${parsedTest.data}`);
        //appendToConsole("Output: " + JSON.stringify(data.output));
        //appendToConsole(`Output: ${data.output}`);

        setTestOutput(JSON.stringify(data.output));
        
      }catch(err) {
        setTestOutput("Error: "+err.message);    
      }
    }
    if(inputSource == "dataset"){
      console.log("HandleRun called (dataset)");
      

      try{
        setTrainingStatus("Testing on MNIST...");
        const res = await fetch("https://blockbuild-ai-u4d8.onrender.com/test_dataset", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            noise_level: noiseLevel,
            datasetName: dataset,
          }),
        })

        const data = await res.json();

        appendToConsole("TEST OUTPUT");
        appendToConsole(
        `Accuracy: ${(data.accuracy * 100).toFixed(2)}%`
        );
        appendToConsole(
          `Correct: ${data.correct} / ${data.total}`
        );

        if(Array.isArray(data.samples)){
          data.samples.forEach((s, i) =>{
            appendToConsole(
              `Sample ${i}: true=${s.true}, pred=${s.pred}`
            );
          });
        }
        
        setTestOutput(JSON.stringify(data, null, 2));
        setTrainingStatus("MNIST testing completed.");
      } catch (err){
        appendToConsole("Dataset test failed");
        setTestOutput("Error" + err.message);
        
        setTrainingStatus("Testing failed! (network error)");
      }
    }
    
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "linear-gradient(160deg, #d8eef7, #c7e6f4, #bfe0f0)"}}>
      {/* Lenta */}
      <div 
        style={{
          position: "fixed",
          padding: "10px",
          background: "rgb(0, 0, 0)", 
          color: "white", 
          display: "flex", 
          gap: 10,
          borderRadius: "8px",
          border: "0px solid black",
          minWidth: "180px",
          minHeigth: "100px",

          zIndex: 10000, 

          //overflowX: "auto",
          //overflowY: "visible",

          //flexWrap: "wrap",
        }}>
        <button onClick={handleAddLinear}>➕ Add Linear</button>
        <button onClick={handleAddReLU}>➕ Add ReLU</button>
        <button onClick={handleAddDropout}>➕ Add Dropout </button>
        <button onClick={handleAddLayerNorm}>➕ Add LayerNorm</button>
        <button onClick={handleAddEmbedding}>➕ Add Embedding</button>
      
        <AddLayerButton
          label="Add Convolution Layer"
          options={[
            {label: "Conv1D", value: "conv1d"},
            {label: "Conv2D", value: "conv2d"},
            {label: "Conv3D", value: "conv3d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>
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
            {label: "AvgPool3D", value: "avgpool3d"},
          ]}  
          onAddNode={(value) => onAddNode(value)}/>
        <AddLayerButton
          label="Add MaxPooling Layer"
          options={[
            {label: "MaxPool1D", value: "maxpool1d"},
            {label: "MaxPool2D", value: "maxpool2d"},
            {label: "MaxPool3D", value: "maxpool3d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>
        <AddLayerButton
          label="Add AdaptiveAvgPooling Layer"
          options={[
            {label: "AdaptiveAvgPool1D", value: "adaptiveavgpool1d"},
            {label: "AdaptiveAvgPool2D", value: "adaptiveavgpool2d"},
          ]}
          onAddNode={(value) => onAddNode(value)}/>

        <button onClick={() => handleAddConcatNode("concat")}>
          ➕Concat
        </button>
        <button onClick={() => handleAddSoftmaxNode("softmax")}>
          ➕Softmax
        </button>
        <button onClick={() => handleAddMatMulNode("matmul")}>
          ➕MatMul
        </button>
        <button onClick={() => handleAddScaleNode("scale")}>
          ➕Scale
        </button>
        <button onClick={() => handleAddMaskNode("mask")}>
          ➕Mask
        </button>
      </div>
      

        {/* Training and Testing*/}
      <div style={{
            position: "fixed",
            //position: "absolute",
            top: 90,
            left: 10,
            width: 300,
            padding: 16,
            //background: "rgb(40, 215, 235)",
            //background: "rgba(255,255,255,0.15)",
            //background: "rgba(255,255,255,0.2)",
            //background: "rgba(255,255,255,0.3)",
            //background: "rgba(6, 38, 135, 0.6)",
            background: "#668fb7",
            //background: "rgba(69, 232, 238, 0.75)",
            color: "white",
            border: "1px solid #333",
            borderRadius: 8,
            zIndex: 2000,
            minHeight: "200px",
          }}>
          
          <h4> Training Parameters: </h4>

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

          <h3> Input Source</h3>
          <label>
            <input
              type = "radio"
              value = "manual"
              checked = {inputSource === "manual"}
              onChange={() => setInputSource("manual")}
            />
            Manual
          </label>
          <br/>

          <label> 
            <input
              type = "radio"
              value = "dataset"
              checked = {inputSource === "dataset"}
              onChange={() => setInputSource("dataset")}
            />
            Dataset (MNIST)
          </label>
          <hr/>

          {inputSource === "manual" && (
            <div>
            <h3> Training </h3>
            <TrainingDataInput onDataReady={handleDatasetSubmit} />
            <button onClick={handleTrain}> Train </button>
            <p>{trainStatus}</p>

            <h3> Testing </h3>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              style={{width: "250px", height: "60px"}}
              rows={2}
              placeholder="Enter test input (only one test)"
            />
            {/*<button onClick={handleRun}>Run</button>*/}
            <button type="button" onClick={handleRun}>
              Run
            </button>
          </div>
        )}

        {inputSource === "dataset" && (
          <div style = {{ marginBottom: 10}}>
            <label> 
              Dataset: 
              <select 
                value = {dataset}
                onChange = {(e) => setDataset(e.target.value)}
              >
                <option value="mnist"> MNIST </option>
                <option value="fashion"> Fashion MNIST</option>
              </select>
            </label>

            <br/>

            <label> 
              Batch size
              <input
                type="number"
                defaultValue={64}
                min={1}
                max={1024}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                style={{width: 80}}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 5, color: "white"}}>
              Noise Level: 
              <input
                type="number"
                min={0.0}
                max={1.0}
                step="0.01"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
                style={{width: 70}}
                />
            </label>
            <>
              <button type="button" onClick={handleTrain}>
                Train on MNIST train set
              </button>
              <button type="button" onClick={handleRun}> 
                Run on MNIST test set
              </button>
              <p>{trainStatus}</p>
            </>

          </div> 
        )}

          
      </div>
      <div>


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
      <div style={{ width: "100%", height: "100%", paddingTop: 70 }}>
  
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
        {/*<Background />
        <Controls />*/}
      </ReactFlow>
      </div>
    </div>
  )
}
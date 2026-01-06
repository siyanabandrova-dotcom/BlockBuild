from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict

import torch
import torch.nn as nn
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NodeData(BaseModel):
    id: str
    type: str  # "linear", "relu", "dropout", "layernorm", "conv", "maxpool"

    inFeatures: Optional[int] = None
    outFeatures: Optional[int] = None

    p: Optional[float] = None

    normalizedShape: Optional[int] = None

    dim: Optional[Literal["1d", "2d", "3d"]] = None
    inChannels: Optional[int] = None
    outChannels: Optional[int] = None

    kernelSize: Optional[int] = None
    stride: Optional[int] = None
    padding: Optional[int] = None

    kernelH: Optional[int] = None
    kernelW: Optional[int] = None
    strideH: Optional[int] = None
    strideW: Optional[int] = None
    padH: Optional[int] = None
    padW: Optional[int] = None

    kernelD: Optional[int] = None
    strideD: Optional[int] = None
    padD: Optional[int] = None

    kernel: Optional[int] = None  

    poolKernelH: Optional[int] = None
    poolKernelW: Optional[int] = None
    poolStrideH: Optional[int] = None
    poolStrideW: Optional[int] = None

    numEmbeddings: Optional[int] = None
    embeddingDim: Optional[int] = None
    seqLen: Optional[int] = None


class EdgeData(BaseModel):
    source: str
    target: str

class TrainingSample(BaseModel):
    input: dict
    output: dict


class GraphRequest(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]
    epochs: Optional[int]=20
    learningRate: Optional[float]=0.01
    training: List[TrainingSample] 

class RunRequest(BaseModel):
    input: dict

class TrainRequest(BaseModel):
    examples: list[list[str]] 


def topological_sort(nodes, edges):
    node_map = {n.id: n for n in nodes}
    graph = {n.id: [] for n in nodes}
    indegree = {n.id: 0 for n in nodes}

    for e in edges:
        if e.source in graph and e.target in graph:
            graph[e.source].append(e.target)
            indegree[e.target] += 1

    queue = [nid for nid in graph if indegree[nid] == 0]
    result = []

    while queue:
        nid = queue.pop(0)
        result.append(node_map[nid])
        for neighbor in graph[nid]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(nodes):
        raise ValueError("Graph contains a cycle or invalid connections")

    return result


def ensure_conv_input(z: torch.Tensor, dim: str) -> torch.Tensor:
    if dim == "1d":
        if z.dim() == 2:  
            return z.unsqueeze(1) 
        if z.dim() == 3: 
            return z
        raise ValueError(f"Conv1d expects 2D or 3D input, got shape {tuple(z.shape)}")

    if dim == "2d":
        if z.dim() == 2: 
            return z.unsqueeze(1).unsqueeze(-1)
        if z.dim() == 4:
            return z
        raise ValueError(f"Conv2d expects 2D or 4D input, got shape {tuple(z.shape)}")

    if dim == "3d":
        if z.dim() == 2: 
            return z.unsqueeze(1).unsqueeze(-1).unsqueeze(-1)
        if z.dim() == 5:
            return z
        raise ValueError(f"Conv3d expects 2D or 5D input, got shape {tuple(z.shape)}")

    raise ValueError(f"Unknown dim: {dim}")

def adapt_input_to_layer(z, layer, layer_type):
    # Linear (batch, features)
    if isinstance(layer, nn.Linear):
        z = z.float()
        if z.dim()>2:
            z = z.view(z.size(0), -1)
        
        return z

    if any(isinstance(layer, t) for t in [nn.Conv1d, nn.ConvTranspose1d, nn.MaxPool1d, nn.AvgPool1d, nn.AdaptiveAvgPool1d]):
        if z.dim() == 2:
            z = z.unsqueeze(1)

        if z.dim() == 3:
            return z

        z = z.view(z.size(0), 1, -1)
        return z
    
    if isinstance(layer, nn.Embedding):
        if z.dim() == 2 and z.size(1) > 1:
            z = torch.argmax(z, dim=1).view(-1, 1)
        
        if z.dim() == 1:
            z = z.view(-1, 1)

        return z.long()

    return z

sorted_nodes=[]
layers={}

@app.post("/train")
def train(graph: GraphRequest):
    global layers, sorted_nodes

    samples = graph.training
    num_epochs = graph.epochs or 20
    lr = graph.learningRate or 0.01

    def extract_tensor(d):
        return torch.tensor(d["data"], dtype=torch.float32).view(1,-1)
    
    x = torch.cat([extract_tensor(s.input["data"]) for s in samples], dim=0)
    y = torch.cat([extract_tensor(s.output["data"]) for s in samples], dim=0)

    try: 
        sorted_nodes=topological_sort(graph.nodes, graph.edges) 
    except Exception as e:
        return {"error": f"Topological sort failed: {e}"}
    
    print("SORTED:", sorted_nodes)
    print("LAYERS:", layers.keys())
    
    layers={}
    for node in sorted_nodes:
        t=node.type.lower()
        if t == "linear":
            layers[node.id] = nn.Linear(node.inFeatures, node.outFeatures)

        elif t == "relu":
            layers[node.id] = nn.ReLU()

        elif t == "dropout":
            p = 0.5 if node.p is None else float(node.p)
            layers[node.id] = nn.Dropout(p)

        elif t == "layernorm":
            norm_shape = node.normalizedShape or node.inFeatures
            layers[node.id] = nn.LayerNorm(norm_shape)

        elif t == "convtranspose1d": # t == "convtranspose"
                layers[node.id] = nn.ConvTranspose1d(
                    node.inChannels, node.outChannels,
                    kernel_size=node.kernelSize or 3,
                    stride=node.stride or 1,
                    padding=node.padding or 0
                )
        elif t == "convtranspose2d":
                layers[node.id] = nn.ConvTranspose2d(
                    node.inChannels, node.outChannels,
                    kernel_size=(node.kernelH or 3, node.kernelW or 3),
                    stride=(node.strideH or 1, node.strideW or 1),
                    padding=(node.padH or 0, node.padW or 0)
                )
        elif t == "convtranspose3d":
                layers[node.id] = nn.ConvTranspose3d(
                    node.inChannels, node.outChannels,
                    kernel_size=(node.kernelD or 3, node.kernelH or 3, node.kernelW or 3),
                    stride=(node.strideD or 1, node.strideH or 1, node.strideW or 1),
                    padding=(node.padD or 0, node.padH or 0, node.padW or 0)
                )

        elif t == "conv1d":
                print(node.inChannels, node.outChannels)
                layers[node.id] = nn.Conv1d(
                    node.inChannels, node.outChannels,
                    kernel_size=node.kernelSize or 3,
                    stride=node.stride or 1,
                    padding=node.padding or 0
                )
        elif t == "conv2d":
                layers[node.id] = nn.Conv2d(
                    node.inChannels, node.outChannels,
                    kernel_size=(node.kernelH or 3, node.kernelW or 3),
                    stride=(node.strideH or 1, node.strideW or 1),
                    padding=(node.padH or 0, node.padW or 0)
                )
        elif t == "conv3d":
                layers[node.id] = nn.Conv3d(
                    node.inChannels, node.outChannels,
                    kernel_size=(node.kernelD or 3, node.kernelH or 3, node.kernelW or 3),
                    stride=(node.strideD or 1, node.strideH or 1, node.strideW or 1),
                    padding=(node.padD or 0, node.padH or 0, node.padW or 0)
                )

        elif t == "maxpool1d":
            layers[node.id] = nn.MaxPool1d(node.kernel or 2, node.stride or 1)

        elif t == "avgpool1d":
            layers[node.id] = nn.AvgPool1d(node.kernel or 2, node.stride or 1)

        elif t =="adaptiveavgpool":
                layers[node.id] = nn.AdaptiveAvgPool1d(node.outputSize or 1) 

        elif t == "embedding":
            layers[node.id] = nn.Embedding(
                node.numEmbeddings or 16,
                node.embeddingDim or 16
            )

    for node in sorted_nodes:
        print("Node: ",node.id, node.type)

    print("Sorted nodes IDs:", [n.id for n in sorted_nodes])
    print("Layer keys:", list(layers.keys()))

    def forward_once(z):

        for node in sorted_nodes:
            layer = layers[node.id]
            print("Node ",node.id, node.type)
            t=node.type.lower()
            z = adapt_input_to_layer(z, layer, node.type.lower())

            if t in ["linear", "relu", "dropout", "layernorm"]:
                z = layer(z)

            elif t in ["conv1d", "conv2d", "conv3d","convtranspose1d", "convtranspose2d", "convtranspose3d","maxpool1d", "maxpool2d", "maxpool3d", "avgpool1d", "avgpool2d", "avgpool3d","adaptiveavgpool1d", "adaptiveavgpool2d"]:
                if z.dim() == 2:
                    z = z.unsqueeze(1)
                
                z=layer(z)
            elif node.type.lower() == "embedding":
                z = z.long()
                z = layer(z)
                z = z.mean(dim=1)
            else:
                print("⚠️ Unknown node type, using Identity:", node.id, node.type)
                layers[node.id] = nn.Identity()
            
                    
        return z
    
    params = []
    for m in layers.values():
        params += list(m.parameters())

    optimizer = torch.optim.SGD(params, lr=lr)

    loss_history = []

    for epochs in range(num_epochs):
        optimizer.zero_grad()
        z = forward_once(x)
        loss = torch.mean((z-y)**2)
        loss.backward()
        optimizer.step()
        loss_history.append(float(loss.item()))

    for layer in layers.values():
        layer.eval()

    with torch.no_grad():
        out = forward_once(x)

    return {
        "output": out.tolist(),
        "loss": loss_history[-1],
        "loss_history": loss_history,
    }


@app.post("/run")
def run_single(data: dict):
    global layers, sorted_nodes
    if not layers:
        return {"error": "Model not trained"}

    inp = data.get("input")
    if inp is None:
        return {"error": "No input provided"}

    try:
        x = torch.tensor(inp["data"], dtype=torch.float32).view(1, -1)
    except Exception:
        return {"error": "Invalid input format"}

    def forward_once(z):
        for node in sorted_nodes:
            layer = layers[node.id]
            t = node.type.lower()

            if t in ["linear", "relu", "dropout", "layernorm"]:
                z = layer(z)

            elif t in ["conv", "convtranspose", "maxpool", "avgpool", "adaptiveavgpool"]:
                if z.dim() == 2:
                    z = z.unsqueeze(1)
                z = layer(z)

        return z

    with torch.no_grad():
        out = forward_once(x)

    output_list = out.cpu().numpy().tolist()

    return {"output": output_list}

    
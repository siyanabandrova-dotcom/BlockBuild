from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict

import torch
import torch.nn as nn
import math
from fastapi.middleware.cors import CORSMiddleware


import matplotlib
matplotlib.use("Agg") 

import matplotlib.pyplot as plt


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
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

    outputSize: Optional[int] = None

    inputsCount: Optional[int] = None

    softmaxDim: Optional[int] = None


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


def get_inputs_for_nodes(node_id, edges, node_outputs):
    inputs = []
    for e in edges:
        if e.target == node_id:
            if e.source not in node_outputs:
                raise RuntimeError(
                    f"Edge error: '{e.source}' -> '{node_id}'"
                    f"but source is not computed yet"
                )
            inputs.append(node_outputs[e.source])
    
    return inputs

graph_nodes = []
graph_edges = []
sorted_nodes=[]
layers={}

@app.post("/train")
def train(graph: GraphRequest):
    global layers, sorted_nodes, graph_nodes, graph_edges
    graph_nodes = graph.nodes
    graph_edges = graph.edges

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
    
    #print("SORTED:", sorted_nodes)
    #print("LAYERS:", layers.keys())

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

        elif t =="adaptiveavgpool1d":
                layers[node.id] = nn.AdaptiveAvgPool1d(node.outputSize or 1) 

        elif t =="adaptiveavgpool2d":
                layers[node.id] = nn.AdaptiveAvgPool2d(node.outputSize or 1) 

        elif t == "embedding":
            layers[node.id] = nn.Embedding(
                node.numEmbeddings or 16,
                node.embeddingDim or 16
            )

        elif t == "concat":
            layers[node.id] = None
        
        elif t == "softmax":
            dim = node.softmaxDim if node.softmaxDim is not None else -1
            layers[node.id] = nn.Softmax(dim = dim)

        elif t == "matmul":
            layers[node.id] = None
        
        elif t == "scale":
            layers[node.id] = None

        elif t == "mask":
            layers[node.id] = None

    for node in sorted_nodes:
        print("Node: ",node.id, node.type)

    #print("Sorted nodes IDs:", [n.id for n in sorted_nodes])
    #print("Layer keys:", list(layers.keys()))

    def forward_once(z):
        node_outputs = {}

        if z.dim() == 3 and z.shape[1] == 1:
            z = z.transpose(1, 2)
        elif z.dim() == 2:
            z = z.unsqueeze(2)

        for node in sorted_nodes:
            
            t = node.type.lower()

            incoming = get_inputs_for_nodes(node.id, graph.edges, node_outputs)

            if not incoming:
                z = x
            elif t == "concat":
                z = torch.cat(incoming, dim=1)
                node_outputs[node.id] = z
            else:
                z = incoming[0]

            if t == "concat":
                node_outputs[node.id] = z
                continue
            
            layer = layers[node.id]
            #print("Node", node.id, node.type, "input shape:", z.shape)

            if t in [
                "conv1d", "convtranspose1d",
                "maxpool1d", "avgpool1d", "adaptiveavgpool1d"
            ]:
                if z.dim() == 2:
                    z = z.unsqueeze(2)
                elif z.dim() == 3 and z.shape[1] == 1:
                    z = z.transpose(1, 2)

                z = layer(z)

            elif t in ["linear", "layernorm", "relu", "dropout", "softmax"]:
                if z.dim() == 3 and t != "softmax":
                    z = z.squeeze(-1)

                z = layer(z)

            elif t == "embedding":
                z = z.long()
                z = layer(z)
                z = z.mean(dim=1)

            elif t == "matmul":
                if len(incoming) != 2:
                    raise ValueError("MatMul node must have exactly 2 inputs")
                
                a, b = incoming
                if a.dim() == 1:
                    a = a.unsqueeze(0)
                if b.dim() == 1:
                    b = b.unsqueeze(0)

                z = torch.matmul(a, b.T)
                node_outputs[node.id] = z
                continue

            elif t == "scale":
                d_k = z.shape[-1]
                z = z / math.sqrt(d_k)
                node_outputs[node.id] = z
                continue

            elif t == "mask":
                scores = incoming[0]

                T = scores.shape[-1]

                mask = torch.triu(
                    torch.ones(T, T, device=scores.device),
                    diagonal=1
                ) * (-1e9)

                scores = scores + mask
                node_outputs[node.id] = scores

            else:
                raise ValueError(f"Unknown node type: {node.type} (node id: {node.id})")
            
            node_outputs[node.id] = z

        return node_outputs[sorted_nodes[-1].id]
        
    params = []
    for m in layers.values():
        if m is not None:
            params += list(m.parameters())

    optimizer = torch.optim.SGD(params, lr=lr)
    #optimizer = torch.optim.Adam(params, lr=lr)


    loss_history = []

    for epochs in range(num_epochs):
        optimizer.zero_grad()
        z = forward_once(x)

        z = z.view(-1, 1)
        y = y.view(-1, 1)

        loss = torch.mean((z-y)*(z-y))
        loss.backward()
        optimizer.step()
        loss_history.append(float(loss.item()))

    for layer in layers.values():
        if layer is not None:
            layer.eval()

    with torch.no_grad():
        out = forward_once(x)

    clean_loss_history = []
    for l in loss_history:
        if math.isfinite(l):
            clean_loss_history.append(l)
        else:
            clean_loss_history.append(None)

    
    plt.plot(clean_loss_history)
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("BlockBuild – Loss History")
    plt.savefig("loss.png")
    plt.close()

    #print("FINAL MODEL:", {k: type(v).__name__ for k,v in layers.items()})

    return {
        "output": out.tolist(),
        "loss": clean_loss_history[-1],
        #"loss": loss,
        #"loss_history": loss_history,
        "loss_history": clean_loss_history,
    }



@app.post("/run")
def run_single(data: dict):
    #print("RUN INPUT RAW:", data)
    print("===== RAW DATA =====")
    print(data)
    print("TYPE:", type(data))
    print("====================")

    global layers, sorted_nodes, graph_edges
    try: 
        sorted_nodes=topological_sort(graph_nodes, graph_edges) 
    except Exception as e:
        return {"error": f"Topological sort failed: {e}"}
    
    if not layers:
        return {"error": "Model not trained"}

    inp = data.get("input")
    if inp is None:
        return {"error": "No input provided"}

    try:
        inp = data.get("input")

        if isinstance(inp, list):
            values = inp

        elif isinstance(inp, dict) and "data" in inp:
            values = inp["data"]

        else: 
            raise ValueError(f"Unsupported input format: {inp}")
        #x = torch.tensor(inp["data"], dtype=torch.float32).view(1, -1)
        x = torch.tensor(values, dtype=torch.float32).view(1, -1)
        print("RUN INPUT TENSOR:", x, x.shape)

    except Exception:
        return {"error": "Invalid input format"}

    if x.dim() == 1:
        x = x.unsqueeze(0)

    print("SORTED NODES:", [node.id for node in sorted_nodes])

    #z_input = x

    def forward_once(z):
        node_outputs = {}

        if z.dim() == 3 and z.shape[1] == 1:
            z = z.transpose(1, 2)
        elif z.dim() == 2:
            z = z.unsqueeze(2)

        for node in sorted_nodes:
            t = node.type.lower()
            incoming = get_inputs_for_nodes(node.id, graph_edges, node_outputs)

            if not incoming:
                z = x
            elif t == "concat":
                z = torch.cat(incoming, dim=1)
                node_outputs[node.id] = z
            else:
                z = incoming[0]

            if t == "concat":
                node_outputs[node.id] = z
                continue
            
            layer = layers[node.id]

            print("Node", node.id, node.type, "input shape:", z.shape)

            if t in [
                "conv1d", "convtranspose1d",
                "maxpool1d", "avgpool1d", "adaptiveavgpool1d"
            ]:
                if z.dim() == 2:
                    z = z.unsqueeze(2)
                elif z.dim() == 3 and z.shape[1] == 1:
                    z = z.transpose(1, 2)

                z = layer(z)

            elif t in ["linear", "layernorm", "relu", "dropout", "softmax"]:
                if z.dim() == 3 and t != "softmax":
                    z = z.squeeze(-1)

                z = layer(z)

            elif t == "embedding":
                z = z.long()
                z = layer(z)
                z = z.mean(dim=1)


            elif t == "matmul":
                if len(incoming) != 2:
                    raise ValueError("MatMul node must have exactly 2 inputs")
                
                a, b = incoming
                if a.dim() == 1:
                    a = a.unsqueeze(0)
                if b.dim() == 1:
                    b = b.unsqueeze(0)

                z = torch.matmul(a, b.T)
                node_outputs[node.id] = z
                continue

            elif t == "scale":
                d_k = z.shape[-1]
                z = z / math.sqrt(d_k)
                node_outputs[node.id] = z
                continue


            else:
                raise ValueError(f"Unknown node type: {node.type} (node id: {node.id})")
         
            node_outputs[node.id] = z

        return node_outputs[sorted_nodes[-1].id]



        return z
    

    with torch.no_grad():
        out = forward_once(x)

    #output_list = out.cpu().numpy().tolist()
    #output_list = out.cpu().numpy().tolist()
    #output_list = out.squeeze().item()
    output_list = out.squeeze().cpu().numpy().tolist()

    #print("RUN OUTPUT RAW:", out)
    #print("TYPE:", type(out))

    return {"output": output_list}

    
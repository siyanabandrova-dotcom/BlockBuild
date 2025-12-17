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


class GraphRequest(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]
    epochs: Optional[int]=20


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


import torch
import torch.nn.functional as F

import torch

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




@app.post("/run_model")
def run_model_with_backpropagation(graph: GraphRequest):
    try:
        sorted_nodes = topological_sort(graph.nodes, graph.edges)
    except Exception as e:
        return {"error": f"Topological sort failed: {e}"}

    first_linear = next((n for n in sorted_nodes if n.type.lower() == "linear"), None)
    if not first_linear or first_linear.inFeatures is None:
        return {"error": "No valid linear node with inFeatures found"}

    x = torch.randn(1, first_linear.inFeatures)

    layers: Dict[str, nn.Module] = {}

    optimizer = None

    num_epochs = graph.epochs or 20
    lr = 0.01
    loss_history: List[float] = []

    y = None

    for epoch in range(num_epochs):
        z = x

        # FORWARD PASS
        for node in sorted_nodes:
            t = node.type.lower()

            if t == "linear":
                if node.inFeatures is None or node.outFeatures is None:
                    return {"error": f"Linear node {node.id} needs inFeatures/outFeatures"}

                if node.id not in layers:
                    layers[node.id] = nn.Linear(node.inFeatures, node.outFeatures)
                z = layers[node.id](z)

            elif t == "relu":
                z = torch.relu(z)

            elif t == "dropout":
                p_value = 0.5 if node.p is None else float(node.p)
                if node.id not in layers:
                    layers[node.id] = nn.Dropout(p_value)
                z = layers[node.id](z)

            elif t == "layernorm":
                norm_shape = node.normalizedShape if node.normalizedShape is not None else z.shape[-1]
                if node.id not in layers:
                    layers[node.id] = nn.LayerNorm(norm_shape)
                z = layers[node.id](z)

            elif t == "conv":
                if node.dim is None:
                    return {"error": f"Conv node {node.id} needs dim (1d/2d/3d)"}
                if node.inChannels is None or node.outChannels is None:
                    return {"error": f"Conv node {node.id} needs inChannels and outChannels"}

                z_conv = ensure_conv_input(z, node.dim)

                if node.dim == "1d":
                    k = node.kernelSize or 3
                    s = node.stride or 1
                    p = node.padding or 0
                    if node.id not in layers:
                        layers[node.id] = nn.Conv1d(node.inChannels, node.outChannels, kernel_size=k, stride=s, padding=p)
                    z = layers[node.id](z_conv)

                elif node.dim == "2d":
                    kh = node.kernelH or 3
                    kw = node.kernelW or 3
                    sh = node.strideH or 1
                    sw = node.strideW or 1
                    ph = node.padH or 0
                    pw = node.padW or 0
                    if node.id not in layers:
                        layers[node.id] = nn.Conv2d(
                            node.inChannels, node.outChannels,
                            kernel_size=(kh, kw),
                            stride=(sh, sw),
                            padding=(ph, pw),
                        )
                    z = layers[node.id](z_conv)

                elif node.dim == "3d":
                    kd = node.kernelD or 3
                    kh = node.kernelH or 3
                    kw = node.kernelW or 3
                    sd = node.strideD or 1
                    sh = node.strideH or 1
                    sw = node.strideW or 1
                    pd = node.padD or 0
                    ph = node.padH or 0
                    pw = node.padW or 0
                    if node.id not in layers:
                        layers[node.id] = nn.Conv3d(
                            node.inChannels, node.outChannels,
                            kernel_size=(kd, kh, kw),
                            stride=(sd, sh, sw),
                            padding=(pd, ph, pw),
                        )
                    z = layers[node.id](z_conv)
            
            elif t == "convtranspose":
                if node.dim == "1d":
                    convtranspose = nn.ConvTranspose1d(node.inChannels, node.outChannels, kernel_size=node.kernelSize, stride=node.stride)
                    x = convtranspose(x.unsqueeze(2))
                elif node.dim == "2d":
                    convtranspose = nn.ConvTranspose2d(node.inChannels, node.outChannels, kernel_size=(node.kernelH, node.kernelW), stride=(node.strideH, node.strideW))
                    x = convtranspose(x.unsqueeze(2).unsqueeze(3))
                elif node.dim == "3d":
                    convtranspose = nn.ConvTranspose3d(node.inChannels, node.outChannels, kernel_size=(node.kernelD, node.kernelH, node.kernelW), stride=(node.strideD, node.strideH, node.strideW))
                    x = convtranspose(x.unsqueeze(2).unsqueeze(3).unsqueeze(4))
                elif t == "avgpool":
                    if node.dim == "1d": x = nn.AvgPool1d(node.kernel)(x)
                    elif node.dim == "2d": x = nn.AvgPool2d((node.kernelH, node.kernelW), stride=(node.strideH, node.strideW))(x)
                elif t == "adaptiveavgpool":
                    if node.dim == "1d": x = nn.AdaptiveAvgPool1d(node.outputSize)(x)
                    elif node.dim == "2d": x = nn.AdaptiveAvgPool2d((node.outputH, node.outputW))(x)


            elif t == "maxpool":
                if node.dim is None:
                    return {"error": f"MaxPool node {node.id} needs dim (1d/2d/3d)"}

                z_pool = ensure_conv_input(z, node.dim)

                if node.dim == "1d":
                    k = node.kernel or 2
                    if node.id not in layers:
                        layers[node.id] = nn.MaxPool1d(kernel_size=k)
                    z = layers[node.id](z_pool)

                elif node.dim == "2d":
                    kh = node.poolKernelH or 2
                    kw = node.poolKernelW or 2
                    sh = node.poolStrideH or kh
                    sw = node.poolStrideW or kw
                    if node.id not in layers:
                        layers[node.id] = nn.MaxPool2d(kernel_size=(kh, kw), stride=(sh, sw))
                    z = layers[node.id](z_pool)

                else:
                    if node.id not in layers:
                        layers[node.id] = nn.MaxPool3d(kernel_size=2)
                    z = layers[node.id](z_pool)
            elif t == "avgpool":
                if node.dim == "1d":
                    x = nn.AvgPool1d(node.kernel)(x)
                elif node.dim == "2d":
                    x = nn.AvgPool2d(
                        (node.kernelH, node.kernelW),
                        stride=(node.strideH, node.strideW),
                    )(x)

            elif t == "adaptiveavgpool":
                if node.dim == "1d":
                    x = nn.AdaptiveAvgPool1d(node.outputSize)(x)
                elif node.dim == "2d":
                    x = nn.AdaptiveAvgPool2d(
                        (node.outputH, node.outputW),
                    )(x)
            elif t == "embedding":
                num_embeddings = node.numEmbeddings or 16
                emb_dim = node.embeddingDim or 16
                seq_len = node.seqLen or 4

                if node.id not in layers:
                    layers[node.id] = nn.Embedding(num_embeddings, emb_dim)

                idx = torch.randint(0, num_embeddings, (z.shape[0], seq_len), dtype=torch.long)

                z = layers[node.id](idx) 
                z = z.reshape(z.shape[0], -1)  

            else:
                pass

        if y is None:
            y = torch.randn_like(z)

        if optimizer is None:
            params = []
            for m in layers.values():
                params += list(m.parameters())
            optimizer = torch.optim.SGD(params, lr=lr)

        # LOSS 
        loss = torch.mean((z - y) ** 2)
        loss_history.append(float(loss.item()))

        # BACKWARD (AUTOGRAD)
        optimizer.zero_grad() 
        loss.backward()
        optimizer.step()

    z_out = z.detach()

    return {
        "output": z_out.tolist(),
        "loss": float(loss_history[-1]),
        "loss_history": loss_history,
    }

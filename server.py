from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict

import torch
import torch.nn as nn
import math
from fastapi.middleware.cors import CORSMiddleware

from torchvision import datasets, transforms
from torch.utils.data import DataLoader


import matplotlib
matplotlib.use("Agg") 

import matplotlib.pyplot as plt


# Documetation
from fastapi.responses import FileResponse
import os


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
    type: Optional[str] = None  # "linear", "relu", "dropout", "layernorm", "conv", "maxpool"

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

    class Config:
        extra = "allow"


class EdgeData(BaseModel):
    source: str
    target: str

class TrainingSample(BaseModel):
    input: dict
    output: dict


class GraphRequest(BaseModel):
    inputSource: Optional[Literal["manual", "dataset"]] = "manual"
    nodes: List[NodeData]
    edges: List[EdgeData]
    epochs: Optional[int]=20
    learningRate: Optional[float]=0.01
    batchSize: Optional[int] = 64
    training: Optional[List[TrainingSample]] = None
    #noiseLevel: Optional[float] = 0.0
    #datasetName: str
    datasetName: Optional[str] = None
    class Config:
        extra = "allow"

class RunRequest(BaseModel):
    input: dict

class TrainRequest(BaseModel):
    examples: list[list[str]] 

class TestConfig(BaseModel):
    noise_level: float = 0.0
    max_samples: int = 20
    datasetName: Optional[Literal["mnist", "fashion"]] =  "mnist"


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


def load_dataset(dataset_name: str, batch_size=64):
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,),(0.3081,))
    ])

    DATASETS = {
        "mnist": datasets.MNIST,
        "fashion": datasets.FashionMNIST,
    }

    if dataset_name not in DATASETS:
        raise ValueError(f"Unknown dataset: {dataset_name}")
    
    dataset_class = DATASETS[dataset_name]

    train_ds = dataset_class(
        root = "./data",
        train = True,
        download = True,
        transform = transform
    )
    
    test_ds = dataset_class(
        root = "./data",
        train = False,
        download = True,
        transform = transform
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)


    return train_loader, test_loader


def add_noise(x, noise_level):
    if noise_level == 0:
        return x
    noise = noise_level * torch.randn_like(x)
    x = x + noise
    return torch.clamp(x, 0., 1.)

def get_label_map(dataset_name: str):

    if dataset_name == "fashion":
        return{
            0: "T-shirt/Top",
            1: "Trouser",
            2: "Pullover",
            3: "Dress",
            4: "Coat",
            5: "Sandal",
            6: "Shirt",
            7: "Sneakers",
            8: "Bag",
            9: "Ankle boot",
        }
    else:
        return None


def forward_once(z):
        node_outputs = {}

        for node in sorted_nodes:
            t = node.type.lower()
            incoming = get_inputs_for_nodes(node.id, graph_edges, node_outputs)

            if not incoming:
                current = z
            elif t == "concat":
                current = torch.cat(incoming, dim=1)
            else:
                current = incoming[0]

            layer = layers[node.id]

            if t in ["conv2d", "convtranspose2d", "maxpool2d", "avgpool2d", "adaptiveavgpool2d"]:
                if current.dim() != 4:
                    raise ValueError(f"{t} expects 4D input [B,C,H,W], got {current.shape}")
                current = layer(current)

            elif t in ["conv1d", "convtranspose1d", "maxpool1d", "avgpool1d", "adaptiveavgpool1d"]:
                if current.dim() == 4:
                    current = current.view(current.size(0), -1)
                if current.dim() == 2:
                    current = current.unsqueeze(2)
                elif current.dim() == 3 and current.shape[1] == 1:
                    current = current.transpose(1, 2)

                current = layer(current)
            
            elif t in ["linear", "layernorm"]:
                if current.dim() == 4:
                    current = current.view(current.size(0), -1)
                #if current.dim() == 3 and t != "softmax":
                #    current = current.squeeze(-1)
                current = layer(current)

            elif t in ["relu", "dropout", "softmax"]:
                current = layer(current)

            elif t == "embedding":
                if current.dim() == 4:
                    current = current.view(current.size(0), -1)
                current = layer(current.long()).mean(dim=1)

            elif t == "matmul":
                if current.dim() == 4:
                    current = current.view(current.size(0), -1)
                a, b= incoming
                current = torch.matmul(a, b.T)

            elif t == "scale":
                if current.dim() == 4:
                    current = current.view(z.size(0), -1)
                current = current / math.sqrt(current.shape[-1])

            elif t == "mask":
                if current.dim() == 4:
                    current = current.view(current.size(0), -1)
                scores = incoming[0]

                T = scores.shape[-1]

                mask = torch.triu(
                    torch.ones(T, T, device=scores.device),
                    diagonal=1
                ) * (-1e9)
  
                current = scores + mask 

            else:
                raise ValueError(f"Unknown node type {node.type}")
            node_outputs[node.id] = current

        return node_outputs[sorted_nodes[-1].id]

@app.get("/documentation")
def get_documentation():
    return FileResponse(
        "src/BlockBuildDocumentationEnglish.pdf",
        media_type="application/pdf",
        filename="BlockBuildDocumentationEnglish.pdf"
    )

@app.get("/research")
def get_research():
    return FileResponse(
        "src/BlockBuildResearch.pdf",
        media_type="application/pdf",
        filename="BlockBuildResearch.pdf",
    )

@app.get("/dataset3")
def get_dataset3():

    return FileResponse(
        "src/dataset3.txt",
        media_type="application/txt",
        filename="dataset3.txt",
    )


@app.get("/dataset4")
def get_dataset4():
    return FileResponse(
            "src/dataset4.txt",
            media_type="application/txt",
            filename="dataset4.txt",
        )

@app.post("/train")
def train_manual(graph: GraphRequest):
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

        elif t == "maxpool2d":
            layers[node.id] = nn.MaxPool2d(
                kernel_size=(node.kernelH or 2, node.kernelW or 2),
                stride=(node.strideH or 2, node.strideW or 2)
            )

        elif t == "maxpool3d":
            layers[node.id] = nn.MaxPool3d(
                kernel_size=(
                    node.kernelD or 2,
                    node.kernelH or 2,
                    node.kernelW or 2,
                ),
                stride=(
                    node.strideD or 2,
                    node.strideH or 2,
                    node.strideW or 2,
                )
            )

        elif t == "avgpool1d":
            layers[node.id] = nn.AvgPool1d(node.kernel or 2, node.stride or 1)

        elif t == "avgpool2d":
            layers[node.id] = nn.AvgPool2d(
                kernel_size=(
                    node.kernelD or 2,
                    node.kernelH or 2,
                    node.kernelW or 2,
                ),
                stride=(
                    node.strideD or 2,
                    node.strideH or 2,
                    node.strideW or 2,
                )
            )

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
        
    params = []
    for m in layers.values():
        if m is not None:
            params += list(m.parameters())

    #optimizer = torch.optim.SGD(params, lr=lr)
    optimizer = torch.optim.Adam(params, lr=lr)


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

    out = torch.nan_to_num(out, nan=0.0, posinf=1e6, neginf=-1e6)

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


    return {
        "output": out.tolist(),
        "loss": clean_loss_history[-1],
        #"loss": loss,
        #"loss_history": loss_history,
        "loss_history": clean_loss_history,
    }

@app.post("/train_dataset")
def train_dataset(graph: GraphRequest):
    num_epochs = graph.epochs or 5
    lr = graph.learningRate or 0.001
    batch_size = graph.batchSize or 64
    dataset_name = graph.datasetName or "mnist"
    train_loader, test_loader = load_dataset(dataset_name, batch_size)

    global layers, sorted_nodes, graph_nodes, graph_edges

    sorted_nodes = topological_sort(graph.nodes, graph.edges)

    graph_edges = graph.edges
    graph_nodes = graph.nodes

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

        elif t == "maxpool2d":
            layers[node.id] = nn.MaxPool2d(
                kernel_size=(node.kernelH or 2, node.kernelW or 2),
                stride=(node.strideH or 2, node.strideW or 2)
            )

        elif t == "maxpool3d":
            layers[node.id] = nn.MaxPool3d(
                kernel_size=(
                    node.kernelD or 2,
                    node.kernelH or 2,
                    node.kernelW or 2,
                ),
                stride=(
                    node.strideD or 2,
                    node.strideH or 2,
                    node.strideW or 2,
                )
            )

        elif t == "avgpool1d":
            layers[node.id] = nn.AvgPool1d(node.kernel or 2, node.stride or 1)

        elif t == "avgpool2d":
            layers[node.id] = nn.AvgPool2d(
                kernel_size=(
                    node.kernelD or 2,
                    node.kernelH or 2,
                ),
                stride=(
                    node.strideD or 2,
                    node.strideH or 2,
                )
            )

        elif t == "avgpool3d":
            layers[node.id] = nn.AvgPool3d(
                kernel_size=(
                    node.kernelD or 2,
                    node.kernelH or 2,
                    node.kernelW or 2,
                ),
                stride=(
                    node.strideD or 2,
                    node.strideH or 2,
                    node.strideW or 2,
                )
            )

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
    
    
    params = []
    for m in layers.values():
        if m is not None:
            params += list(m.parameters())
    
    optimizer = torch.optim.SGD(params, lr=lr)

    loss_history = []

    criterion = nn.CrossEntropyLoss()
    
    for epoch in range(num_epochs):
        epoch_loss = 0
        for images, labels in train_loader:

            #images = add_noise(images, config.noise_level)
            
            outputs = forward_once(images)
            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

        epoch_loss /= len(train_loader)  
        loss_history.append(epoch_loss)


    for layer in layers.values():
        if layer is not None:
            layer.eval()

    correct = 0
    total = 0

    samples = []

    max_samples = 20

    label_map = None

    if hasattr(train_loader.dataset, "classes"):
        label_map = train_loader.dataset.classes

    with torch.no_grad():
        for x, y in train_loader:
            #x = x.view(x.size(0), -1)
            out = forward_once(x)

            preds = torch.argmax(out, dim = 1)
            correct += (preds == y).sum().item()
            total += y.size(0)
            
            # Show small sample
            for i in range(x.size(0)):
                #if len(samples) >= max_samples:
                #    break
                
                if preds[i] != y[i]:
                    true_label = int(y[i])
                    pred_label = int(preds[i])
                    
                    if label_map is not None:
                        true_label = label_map[true_label]
                        pred_label = label_map[pred_label]

                    samples.append({
                        "true": true_label,
                        "pred": pred_label,
                        "output": out[i].tolist(),
                    })

                if len(samples) >= max_samples:
                    break

    accuracy = correct / total if total > 0 else 0.0

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


    return {
        "accuracy": accuracy,
        "correct": correct,
        "total": total,
        #"output": out.tolist(),
        "loss": clean_loss_history[-1],
        "loss_history": clean_loss_history,
        "samples": samples,
    }


@app.post("/run")
def run_single(data: dict):

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

    except Exception:
        return {"error": "Invalid input format"}

    if x.dim() == 1:
        x = x.unsqueeze(0)

    with torch.no_grad():
        out = forward_once(x)

    #output_list = out.cpu().numpy().tolist()
    #output_list = out.cpu().numpy().tolist()
    #output_list = out.squeeze().item()
    output_list = out.squeeze().cpu().numpy().tolist()


    return {"output": output_list}


@app.post("/test_dataset")
def test_dataset(config: TestConfig):

    train_loader, test_loader = load_dataset(config.datasetName, config.max_samples)

    for layer in layers.values():
        if layer is not None:
            layer.eval()

    correct = 0
    total = 0
    samples = []

    label_map = None
    if hasattr(train_loader.dataset, "classes"):
        label_map = train_loader.dataset.classes

    with torch.no_grad():
        for x, y in test_loader:
            #x = x.view(x.size(0), -1)

            x = add_noise(x, config.noise_level)

            out = forward_once(x)

            preds = torch.argmax(out, dim = 1)
            correct += (preds == y).sum().item()
            total += y.size(0)
            
            # Show small sample
            for i in range(x.size(0)):
                #if len(samples) >= max_samples:
                #    break
                

                if preds[i] != y[i]:
                    true_label = int(y[i])
                    pred_label = int(preds[i])
                    
                    if label_map is not None:
                        true_label = label_map[true_label]
                        pred_label = label_map[pred_label]

                    samples.append({
                        "true": true_label,
                        "pred": pred_label,
                        "output": out[i].tolist(),
                    })

                if len(samples) >= config.max_samples:
                    break



            if len(samples) >= config.max_samples:
                break


    accuracy = correct / total if total > 0 else 0.0

    return {
        "accuracy": accuracy,
        "correct": correct,
        "total": total,
        "samples": samples
    }


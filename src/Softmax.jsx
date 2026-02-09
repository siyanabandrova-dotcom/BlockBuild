import {Handle, Position} from "reactflow";

export default function Softmax ({id, data, setNodes}){
    const dim = data.softmaxDim ?? 1;
    
    const handleChange = (e) =>{
        const value = parseInt(e.target.value, 10)
        if(isNaN(value)) return;
        setNodes((nds) =>
            nds.map((node) =>{
                    if(node.id == id){
                        return{
                            ...node,
                            data:{
                                ...node.data,
                                softmaxDim: value,
                            },
                        }
                    }
                    return node;
                }
            )
        )
    }
    return (
        <div style={{
            padding: 5,
            border: '1px solid black',
            borderRadius: 3,
            backgroundColor: 'white',
            minHeight: 40,
            minWidth: 100,
            minHeight: 40,
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
        }}>
            <strong> Softmax </strong>
            <div>
                <label> Dim </label>
                <input
                    type = "number"
                    value = {data.softmaxDim}
                    onChange = {handleChange}
                    style = {{ width: 50}}
                />
            </div>

            <Handle
                type = "target"
                position={Position.Top}
                id = "out"
            />

            <Handle
                type = "source"
                position={Position.Bottom}
                id = "in"
            />

        </div>
    )
    

}
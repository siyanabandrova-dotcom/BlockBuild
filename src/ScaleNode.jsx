import { Handle, Position } from "reactflow";

export default function ScaleNode ({id, data, setNodes}){
    return(
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
            <strong> Scale </strong>
            <Handle
                type = "target"
                position = {Position.Top}
                id = "in"
            />
            <Handle
                type = "source"
                position = {Position.Bottom}
                id = "out"
            />
        </div>
    )
}
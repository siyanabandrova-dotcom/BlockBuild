import {Handle, Position} from "reactflow";

export default function MatMulNode ({id, data, setNodes}){
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
        <strong> MatMul </strong>
        <Handle
            type="target"
            position={Position.Left}
            id="a"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
        />

        <Handle
            type="target"
            position={Position.Right}
            id="b"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
        />
        <Handle
            type = "source"
            position={Position.Bottom}
            id = "out"
        />

        </div>
    );
}
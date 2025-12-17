import {useState} from "react"

function AddAdaptivePoolButton({onAddNode}){
    const [open, setOpen]=useState(false);

    const handleSelect = (type) =>{
        onAddNode(type);
        setOpen(false);
    };

    return (
        <div style={{ position: "relative", marginBottom: "10px" }}>
            <button onClick={() => setOpen(!open)}>➕Add AdaptiveAvgPool </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        background: "black",
                        border: "1px solid #ccc",
                        padding: "5px",
                        width: "150px",
                        cursor: "pointer",
                        zIndex: 100,
                    }}>
                    <div onClick={() => handleSelect("adaptiveavgpool1d")}>1D</div>
                    <div onClick={() => handleSelect("adaptiveavgpool2d")}>2D</div>
                </div>
            )}
        </div>
    );
}
export default AddAdaptivePoolButton;
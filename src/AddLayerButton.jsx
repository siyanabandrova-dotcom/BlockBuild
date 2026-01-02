import {useState} from "react"
import { Position } from "reactflow";

function AddLayerButton({ label, options, onAddNode}){
    const [open, setOpen] = useState(false)

    const handleSelect = (value) =>{
        onAddNode(value);
        setOpen(false);
    };

    return (
        <div style={{
                    width: "10%",
                    padding: "0px 5px",
                    background: "#000000ff",
                    color: "white",
                    border: "1px solid #080808ff",
                    borderRadius: "0px",
                    textAlign: "left",
                    cursor: "pointer",/*
                    padding: "10px",
                    background: "black", 
                    color: "white", 
                    display: "flex", 
                    gap: 10,
                    borderRadius: "8px",
                    border: "0px solid black",
                    minWidth: "180px",
                    minHeigth: "50px",*/
                                
                }}>
            <button onClick={() => setOpen(!open)}>
                ➕ {label}
            </button>
            
            {open && (
                <div
                    style={{
                        position: "absolute",
                        background: "black",
                        border: "1px solid #ccc",
                        padding: "5px",
                        width: "150px",
                        height: "80px",
                        cursor: "pointer",
                        textAlign: "left",
                        zIndex: 100
                    }}
                >
                {options.map((opt) => ( 
                    <div
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        style={{padding: "3px 0"}}
                    >
                        {opt.label}
                    </div>
                ))}
                </div>
            )}


        </div>
    );
}
export default AddLayerButton;
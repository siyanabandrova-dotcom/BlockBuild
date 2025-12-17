import {useState} from "react"
function AddConvButton({onAddNode}){
    const [open, setOpen] = useState(false);

    const handleSelect = (type) =>{
        onAddNode(type);
        setOpen(false);

    };
    return (
        <div style={{position: "relative", marginBottom: "0px"}}>
            <button onClick={() => setOpen(!open)}>
                ➕Add Convolution Layer    
            </button>    
        {open && (<div style={{
            position: "absolute",
            background: "black",
            border: "1px solid #ccc", 
            marginTop: "10px", 
            width: "100px", 
            height: "70px",
            cursor: "pointer", 
            zIndex: 10 }}>
                <div onClick={() => handleSelect("conv1d")}> Conv1 </div>
                <div onClick={() => handleSelect("conv2d")}> Conv2 </div>
                <div onClick={() => handleSelect("conv3d")}> Conv3 </div>

            </div>)  

        }
        </div>
    )
}
export default AddConvButton;
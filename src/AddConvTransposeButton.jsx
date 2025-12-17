import {useState} from "react"
function AddConvTransposeButton({onAddNode}){
    const [open, setOpen] = useState(false);

    const handleSelect = (type) =>{
        onAddNode(type);
        setOpen(false);

    };
    return (
        <div style={{position: "relative", marginBottom: "0px"}}>
            <button onClick={() => setOpen(!open)}>
                ➕Add ConvolutionTranspose Layer
            </button>    
        {open && (<div style={{
            position: "absolute",
            background: "black",
            border: "1px solid #ccc", 
            marginTop: "10px", 
            width: "130px", 
            height: "50px",
            cursor: "pointer", 
            zIndex: 10 }}>
                <div onClick={() => handleSelect("convtranspose1d")}> ConvTranspose1d </div>
                <div onClick={() => handleSelect("convtranspose2d")}> ConvTranspose2d </div>

            </div>)  

        }
        </div>
    )
}
export default AddConvTransposeButton;
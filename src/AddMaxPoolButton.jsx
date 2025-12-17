import  {useState} from "react"

function AddMaxPoolButton({onAddNode}){
    const [open, setOpen] = useState(false)

    const handleSelect = (type) =>{
        onAddNode(type);
        setOpen(false);
    };

    return(
        <div style={{ position: "relative", marginBottom: "0px" }}>
            <button onClick={() => setOpen(!open)}>➕ Add MaxPool</button>
            {open && (
                <div style={{ position: "absolute",
                    background: "black",
                    border: "1px solid #ccc",
                    padding: "5px",
                    width: "100px",
                    cursor: "pointer",
                    zIndex: 100,}}>
                    <div onClick={() => handleSelect("maxpool1d")}> MaxPool1d </div>
                    <div onClick={() => handleSelect("maxpool2d")}> MaxPool2d </div>
                    <div onClick={() => handleSelect("maxpool3d")}> MaxPool3d </div>
                </div>
            )}
        </div>
    );
}

export default AddMaxPoolButton;
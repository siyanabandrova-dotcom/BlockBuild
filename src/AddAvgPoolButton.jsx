import {useState} from "react";

function AddAvgPoolButton({onAddNode}){
    const [open, setOpen] = useState(false);

    const handleSelect = (type) =>{
        onAddNode(type);
        setOpen(false);
    }

    return (
    <div style={{ position: "relative", marginBottom: "0px" }}>
      
      <button onClick={() => setOpen(!open)}>
        ➕ Add AvgPool Layer
      </button>

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
          }}
        >
          <div onClick={() => handleSelect("1d")}>AvgPool1d</div>
          <div onClick={() => handleSelect("2d")}>AvgPool2d</div>
          <div onClick={() => handleSelect("3d")}>AvgPool3d</div>
        </div>
      )}
    </div>
  );
}
export default AddAvgPoolButton;
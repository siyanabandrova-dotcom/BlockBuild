import React, { useState} from "react";

function AddBatchNormButton({ onAdd }){
    const [open, setOpen] = useState(false)
     return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}>
        ➕ BatchNorm
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#141313",
            padding: "5px",
            zIndex: 1000,
            minWidth: "140px",
          }}
        >
          <div
            style={{ cursor: "pointer", padding: "5px" }}
            onClick={() => {
              onAdd("batchnorm1d");
              setOpen(false);
            }}
          >
            BatchNorm1d
          </div>

          <div
            style={{ cursor: "pointer", padding: "5px" }}
            onClick={() => {
              onAdd("batchnorm2d");
              setOpen(false);
            }}
          >
            BatchNorm2d
          </div>
        </div>
      )}
    </div>
  );
}

export default AddBatchNormButton;

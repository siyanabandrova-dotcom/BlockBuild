function CustomBlock({x,y,onMouseDown}) {
    return (
        <div
            onMouseDown={onMouseDown}
            style={{
                width: "100px",
                height: "100px",
                backgroundColor: "red",
                position: "absolute",
                left: x + "px",
                top: y + "px",
                cursor: "grab",
                userSelect: "none",
                touchAction: "none",
            }}></div>
    );
    
}   
export CustomBlock;
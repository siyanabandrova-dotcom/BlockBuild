import { useRef, useState } from "react";

export default function DrawCanvas({ onPredict }){
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);

    const startDrawing = (e) =>{
        setDrawing(true);
        const canvas = canvasRef.current
        const ctx =  canvas.getContext("2d")

        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    } 
    const stopDrawing = () =>{
        setDrawing(false);
        const ctx = canvasRef.current.getContext("2d")
        ctx.beginPath()
    }

    const draw = (e) =>{
        if(!drawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.strokeStyle = "white";

        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }

    const clear = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 280, 280);
    }

    const predict = () =>{
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL("image/png");
        onPredict(dataUrl);
    }

    return (
        <div>
            <canvas
                ref = {canvasRef}
                width = {280}
                height = {280}
                //style = {{ border: "1px solid black", background: "white"}}
                style={{ border: "1px solid black", background: "black" }}
                onMouseDown = {startDrawing}
                onMouseUp = {stopDrawing}
                onMouseMove = {draw}
            />
            <br/>
            <button onClick = {clear}> Clear </button>
            <button onClick = {predict}> Predict </button>
        </div>
    )
}
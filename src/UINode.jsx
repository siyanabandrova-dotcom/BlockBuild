import { useState } from "react"
import { useEffect } from "react";

const UINode = ({data}) =>{
    const [plotUrl, setPlotUrl] = useState("")

    const API_URL = "https://blockbuild-api.onrender.com";
    //const LOCAL_URL = "http://localhost:8000";

    useEffect(() => {
        const interval = setInterval(() => {
        setPlotUrl(`${API_URL}/loss_plot?${Date.now()}`);
        }, 2000);

        return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#111",
      padding: 10,
      borderRadius: 10,
      color: "white",
      width: 450,
    }}>

        <div style={{ marginBottom: 5 }}>
            📊 {data.label}
        </div>

        <img
        src={plotUrl}
        alt="Loss"
        style={{ width: "100%", borderRadius: 6 }}
      />
    </div>
  )

}
export default UINode;
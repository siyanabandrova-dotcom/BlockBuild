import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Toolbar = () =>{
    const navigate = useNavigate();
    const location = useLocation();

    const [open, setOpen] = useState(false);

    if (location.pathname === "/workspace") return null;

    const openFile = (file) => {
        window.open(process.env.PUBLIC_URL + "/" + file, "_blank");
    };

    const buttonStyle = {
        background: "transparent",
        border: "none",
        color: "white",
        fontSize: 16,
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: 8,
        transition: "all 0.2s ease"
    };

    const dropdownItemStyle = {
        padding: "8px 12px",
        cursor: "pointer",
        color: "white",
        fontSize: 16,
        position: "relative",
        top: "100%",  
    };

    return(
        <div style = {{

            padding: "12px 40px",
            display: "flex",
            //justifyContent: "space-between",
            //alignItems: "center",
            background: "rgba(0,0,0,0.15)",
            backdropFilter: "blur(6px)",
            fontSize: 38
        }}>
        

        <button 
            style={buttonStyle} 
            onClick={() => navigate("/")}
            onMouseEnter={(e) => 
                (e.target.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
            }
            
            > Home </button>
        <button style={buttonStyle} onClick={() => navigate("/workspace")}
            onMouseEnter={(e) => 
                (e.target.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
            }
            > Workspace </button>
        {/*<button style={buttonStyle} onClick={() => navigate("/docs")}
            onMouseEnter={(e) => 
                (e.target.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
            }
            > Documentation</button>*/}

        <button 
            style={buttonStyle}
            onMouseEnter={(e) => 
                (e.target.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
            }
            //onClick={() => window.open("/BlockBuildDocumentationEnglish.pdf", "_blank")}
            onClick={() => openFile("BlockBuildDocumentationEnglish.pdf")}
        >
            Documentation
        </button>

        <div style={{padding: "2px 0px",
    display: "flex",
    fontSize: 38}}>

        <button 
            style={buttonStyle}
            onMouseEnter={(e) => 
                (e.target.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
            }
            onClick={() => setOpen(!open)}
        >
            Dataset ▼
        </button>

        {open && (
            <div style={{
                position: "absolute",
                //position: "flex",
                top: "50px",
                left: "360px",
                //background: "#316475",
                background: "#2999c9",
                //background: "linear-gradient(135deg, #2999c9, #316475)",
                //background: "transparent",, #21414f
                borderRadius: "8px",
                padding: "5px 0",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                minWidth: "150px",
                zIndex: 1000
            }}>
                <div style={dropdownItemStyle}
                    onClick={() => {
                    //window.open("/dataset3.txt", "_blank")
                    openFile("dataset3.txt");
                    setOpen(false);
                    }}>
                    Forex Prediction
                </div>

                <div style={dropdownItemStyle}
                    onClick={() => {
                    openFile("dataset4.txt");
                    setOpen(false);
                    }}>
                    Housing Prices Prediction
                </div>
            </div>
        )}
        </div>

        <button 
            style={buttonStyle}
            onMouseEnter={(e) => 
                (e.target.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
                (e.target.style.background = "transparent")
            }
            onClick={() => openFile("BlockBuildResearch.pdf")}
        >
            Research for Forex
        </button>

        </div>

    )
}
export default Toolbar;
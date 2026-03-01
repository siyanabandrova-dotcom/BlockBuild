import { useNavigate } from "react-router-dom";

export default function Home(){
    const navigate = useNavigate();

    const cardStyle = {
        background: "rgba(255,255,255,0.1)",
        border: "2px solid rgba(255,255,255,0.3)",
        borderRadius: 18,
        padding: 30,
        width: "100%",
        maxWidth: 600,
        textAlign: "left",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
    };

    return(
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #2999c9, #316475, #21414f)",
            //background: "linear-gradient(160deg, #1c3a46, #21414f, #162d36)",
            //background: #1c3a46,
            color: "white",
            display: "flex", //// HERE
            flexDirection: "column",
            //justifyContent: "center",
            //alignItems: "center",
            fontFamily: "Arial, sans-serif",
            //overflow: "hidden",
            //textAlign: "center",
            padding: 20,
            position: "center",
            }}>

            {/* HEADER 
            <div
            style={{
                padding: "12px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(0,0,0,0.15)",
                backdropFilter: "blur(6px)",
                fontSize: 18
            }}
            >
            <h1 style={{
            fontSize: 40,
            marginBottom: 20,
            letterSpacing: 2,
            }}> BlockBuild </h1>
            <h3 style={{
                fontSize: 22,
                maxWidth: 700,
                marginBottom: 40,
                opacity: 0.9,
            }}> Visual Neural Network Builder</h3>
                            

            </div>*/}
            
            <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: 20
            }}
            >
            <h1
                style={{
                fontSize: 60,
                marginBottom: 20,
                letterSpacing: 2
                }}
            >
                BlockBuild
            </h1>

            <h3
                style={{
                fontSize: 22,
                maxWidth: 700,
                marginBottom: 40,
                opacity: 0.9
                }}
            >
                Application for visual creation and training of neural networks
            </h3>
            </div>

            <div
            style={{
                height: 2,
                width: "100%",
                background: "linear-gradient(to right, transparent, #00d4ff, transparent)",
                margin: "40px 0",
                boxShadow: "0 0 20px rgba(0,212,255,0.6)"
            }}
            />


            <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 25,
                marginBottom: 40,
                flexWrap: "wrap"
            }}
            >
            <p
                style={{
                fontSize: 22,
                maxWidth: 600,
                opacity: 0.9,
                margin: 0
                }}
            >
                Create AI models. Train them instantly. Experiment freely.
            </p>
            <button
                onClick={() => navigate("/workspace")}
                style={{
                padding: "14px 32px",
                fontSize: 20,
                border: "none",
                cursor: "pointer",
                background: "#eef2f3",
                color: "#000",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                borderRadius: 999,
                letterSpacing: 1
                }}
                onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.6)";
                }}
                onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "none";
                }}
            >
                Enter Workspace
            </button>

            {/*<div
            style={{
                height: 1,
                width: "100%",
                background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                margin: "40px 0"
            }}
            />*/}

            <div
            style={{
                height: 2,
                width: "100%",
                background: "linear-gradient(to right, transparent, #00d4ff, transparent)",
                margin: "40px 0",
                boxShadow: "0 0 20px rgba(0,212,255,0.6)"
            }}
            />

            
            </div>

            <div  style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 30
            }}>
                <h2 style={{ fontSize: 36, marginBottom: 50 }}>
                    Showroom    
                </h2>

                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 40,
                    flexWrap: "wrap"
                    }}>

                    {/* Project Cards */}
                    <div  style={cardStyle} 
                        onClick = {() => navigate("/workspace", {state: {preset: "mnist"}})}
                        onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.6)";
                        }}

                        onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                        }}
                        >
                        <h3> MNIST Classifier </h3>
                        
                        <p style={{ opacity: 0.8 }}>
                            Neural network trained on handwritten digits.
                        </p>
                        
                    </div>

                    <div style = {cardStyle}
                        onClick={() => navigate("/workspace", {state: {preset: "fashion"}})}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.6)"
                        }}

                        onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                        }}
                        >
                        <h3> Fashion-MNIST Classifier </h3>
                        <p style={{ opacity: 0.8 }}>
                            Image classifier for black-and-white clothes images.    
                        </p>
                    </div>

                    {/*<div style = {cardStyle}>
                        <h3> Kuzushiji-MNIST Classifier </h3>
                        <p style={{ opacity: 0.8 }}>
                            Image classifier for handwritten Kuzushiji (cursive Japanese) Hiragana characters.    
                        </p>
                    </div>*/}

                    <div style = {cardStyle}
                        onClick={() => navigate("/workspace", {state: {preset: "forex"}})}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.6)"
                        }}

                        onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                        }}>
                        <h3> Forex Trade Prediction </h3>
                        <p style={{ opacity: 0.8 }}>
                            Model for prediction of the exchange rate EUR - USD.
                        </p>
                    </div>

                    {/*<div style = {cardStyle}>
                        <h3> Student Performance Prediction </h3>
                        <p style={{ opacity: 0.8 }}>
                            Model predicting if a student will pass the exam accirding to styding hours,
                             homeworks, grades, attendance.
                        </p> 
                    </div>

                    <div style = {cardStyle}>
                        <h3> Medical Risk Classifier </h3> 
                        <p style={{ opacity: 0.8 }}>
                            Model predicting cardiac risk according to age, blood pressure, cholesterol, BMI, pulse.
                        </p>

                    </div>*/}

                    <div style = {cardStyle}
                        onClick={() => navigate("/workspace", {state: {preset: "housing"}})}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.6)"
                        }}

                        onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                        }}>
                        <h3> Housing Prices Prediction </h3> 
                        <p style={{ opacity: 0.8 }}>
                            Model predicting housing prices according to sqr meters, number of rooms, year, distance from the center.
                        </p>

                    </div>
                </div>

            </div>

            <div style={{ marginTop: 60, opacity: 0.6, fontSize: 14 }}>
                Built with React • FastAPI • PyTorch  
                <br />
                 © 2026 BlockBuild
            </div>


            {/* Footer */}

            {/*<div
            style={{
                padding: 0,
                textAlign: "center",
                background: "rgba(0,0,0,0.25)",
                fontSize: 15,
                opacity: 0.8,
                position: "fixed",
                bottom: "20px",
                //right: "20px",
            }}
            >
            Built with React • FastAPI • PyTorch  
            <br />
            © 2026 BlockBuild
            </div>*/}

            {/*<div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                opacity: 0.6,
                fontSize: "14px"
            }}
            >
            Built with React • FastAPI • PyTorch  
            <br />
            © 2026 BlockBuild
            </div>*/}

        </div>
    )
}
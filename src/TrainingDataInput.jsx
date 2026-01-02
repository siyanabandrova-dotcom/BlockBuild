import {useState} from "react";
import { validateAllSamples } from "./parseSample";

export default function TrainingDataInput({onDataReady}){
    const [count, setCount] = useState(1);
    const [inputStr, setInputStr] = useState("");
    const [outputStr, setOutputStr] = useState("");

    const handleSubmit = () =>{
        const inputLines=inputStr.trim().split("\n");
        const outputLines = outputStr.trim().split("\n");

        if(inputLines.length !== count){
            return alert("Input count does not match!")
        }   
        if(outputLines.length !== count){
            return alert("Output count does not match!")
        }
        try{
            const parsedInputs=validateAllSamples(inputLines);
            const parsedOutputs=validateAllSamples(outputLines);

            onDataReady({
                inputs: parsedInputs,
                outputs: parsedOutputs,
            });
        } catch (err){
            alert(err.message);
        }
    };

    return (
        <div style={{padding: "10px"}}>

            <label> Number of samples</label>
            <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                style={{width: "80px", marginBottom: "10px"}}
                placeholder="Number of samples"
            />

            <div>
                <label> Input samples: </label>
                <textarea
                    value={inputStr}
                    onChange={(e) => setInputStr(e.target.value)}
                    rows={6}
                    style={{ width: "100%" }}
                    placeholder="Enter input samples"
                />
            </div>

            <div>
                <label> Output samples: </label>
                <textarea
                    value={outputStr}
                    onChange={(e) => setOutputStr(e.target.value)}
                    rows={6}
                    style={{ width: "100%" }}
                    placeholder="Enter output samples"
                />
            </div>

            <button onClick={handleSubmit}>Parse and Validate</button>
        </div>
    )
}
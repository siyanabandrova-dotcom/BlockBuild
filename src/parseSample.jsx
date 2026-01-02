export function parseSample(str){
    if (typeof str !== "string") {
        throw new Error("parseSample: input is not string");
    }

    const rows = str.trim().split(";").map(r => r.trim());

    const matrix = rows.map(row =>
        row.trim().split(/[ \s,]+/).map(Number)
    );

    if(matrix.length === 1){
        return {
            data: matrix[0],
            shape: [matrix[0].length]
        }
    }

    return {
        data: matrix,
        shape: [matrix.length, matrix[0].length]
    };
}

export function validateAllSamples(samples){
    const first=parseSample(samples[0])
    const baseShape=first.shape;

    for(let i=1;i<samples.length;i++){
        const curr=parseSample(samples[i]);
        if(JSON.stringify(curr.shape) !== JSON.stringify(baseShape)){
            throw new Error(`Sample #${i + 1} shape mismatch! Expected ${baseShape}, got ${curr.shape}`);
        }
    }
    return samples.map(parseSample);
}
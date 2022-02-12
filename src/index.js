
/*
Options
    faceVertices - This will be used as a starting point for the shape
    maxVertices - integer - this will indicate the maximum number of integers the random shape could have.
                    This has to be greater than 3.
    buffer - array of length 3 - denotes buffer for x, y and z axis.
Returns Obj of vertices and indices
*/
export default function getRandomShape(options) {
    const {
        faceVertices,
        maxVertices,
        buffer
    } = options;

    if (maxVertices<=3) {
        throw 'Max vertices should be greater than 3!';
    }
    if (faceVertices.length!==9) {
        throw 'Not enough vertices! Needs 9.';
    }

    const numNewVertices = maxVertices - 3;
    const [bufferX, bufferY, bufferZ] = buffer;
    let indices = [0, 1, 2]; // pick starting 3 points and consider them a face
    let vertices = Array.from(faceVertices);

    for (let v = 0; v<numNewVertices; v++) {
        const availableFaces = indices.length/3;
        const randomFaceIdx = Math.floor(Math.random() * availableFaces);

        const randomFaceIndices = indices.slice(randomFaceIdx*3, (randomFaceIdx*3)+3);
        const randomFaceVertices = [
            vertices[randomFaceIndices[0]],
            vertices[randomFaceIndices[1]],
            vertices[randomFaceIndices[2]],
        ];

        const { subVertices, subIndices } = processVertex(randomFaceVertices, randomFaceIndices, vertices.length / 3);

        vertices = vertices.concat(subVertices);
        indices = indices.concat(subIndices);
    }

    vertices = new Float32Array(vertices);
    

    

    return {
        vertices,
        indices, 
    };

    function processVertex(faceVertices, faceIndices, newIndex) {
        let minX, maxX, minY, maxY, minZ, maxZ;
        for (let i = 0; i < 3; i++) {
            let x = i * 3;
            // mins
            if (typeof minX === 'undefined' || faceVertices[x] < minX) {
                minX = faceVertices[x];
            }
            if (typeof minY === 'undefined' || faceVertices[x + 1] < minY) {
                minY = faceVertices[x + 1];
            }
            if (typeof minZ === 'undefined' || faceVertices[x + 2] < minZ) {
                minZ = faceVertices[x + 2];
            }
            // maxs
            if (typeof maxX === 'undefined' || faceVertices[x] > maxX) {
                maxX = faceVertices[x];
            }
            if (typeof maxY === 'undefined' || faceVertices[x + 1] > maxY) {
                maxY = faceVertices[x + 1];
            }
            if (typeof maxZ === 'undefined' || faceVertices[x + 2] > maxZ) {
                maxZ = faceVertices[x + 2];
            }
        }

        minX -= bufferX;
        minY -= bufferY;
        minZ -= bufferZ;
        maxX += bufferX;
        maxY += bufferY;
        maxZ += bufferZ;

        const randomX = Math.random() * (maxX - minX + 1) + minX,
            randomY = Math.random() * (maxY - minY + 1) + minY,
            randomZ = Math.random() * (maxZ - minZ + 1) + minZ;

        const vertices = [randomX, randomY, randomZ];
        const [i1, i2, i3] = faceIndices;
        const iN = newIndex;
        const indices = [
            // i1, i2, i3,
            iN, i2, i3,
            i1, iN, i3,
            i1, i2, iN,
        ];
        return { subVertices: vertices, subIndices: indices };
    }
}
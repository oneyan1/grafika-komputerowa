$(() => {

    const canvas = $("#canvas")[0];
    const context = canvas.getContext("2d");

    let loadedFile;

    document.getElementById("drop-area").addEventListener("dragover", event => {
        event.preventDefault();
    }, true);

    document.getElementById("drop-area").addEventListener("drop", event => {
        const data = event.dataTransfer;
        event.preventDefault();
        handleFile(data.files[0]);
    }, true);

    const handleFile = file => {
        const imageType = /image.*/;
        if (file.type.match(imageType)) {
            const reader = new FileReader();
            reader.onloadend = event => {
                const image = new Image();
                image.onload = e => {
                    canvas.height = e.target.height;
                    canvas.width = e.target.width;
                    context.drawImage(e.target, 0, 0);
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
            loadedFile = file;
        }
    };

    $("#dilation").click(() => {
        applyDilation();
    });

    $("#erosion").click(() => {
        applyErosion();
    });

    $("#morphological-opening").click(() => {
        applyMorphologicalOpening();
    });

    $("#morphological-closing").click(() => {
        applyMorphologicalClosing();
    });

    $("#hit-or-miss").click(() => {
        applyHitOrMiss();
    });

    $("#reset").click(() => {
        handleFile(loadedFile);
    });

    const isAnyNeighboringPixelBlack = (x, y) => {
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                let [ R, G, B ] = context.getImageData(i, j, 1, 1).data;
                if (R === 0 && G === 0 && B === 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const isAnyNeighboringPixelWhite = (x, y) => {
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                let [ R, G, B ] = context.getImageData(i, j, 1, 1).data;
                if (R === 255 && G === 255 && B === 255) {
                    return true;
                }
            }
        }
        return false;
    };

    const checkNeigbhoringIndexes = (array, x, y) => {
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i > 0 && i < canvas.width - 1 && j > 0 && j < canvas.height - 1) {
                    if (!array[i][j]) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const applyDilation = () => {
        const filteredImage = [];
        for (let i = 0; i < canvas.width; i++) {
            filteredImage[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                filteredImage[i][j] = isAnyNeighboringPixelBlack(i, j);
            }
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                if (filteredImage[i][j]) {
                    pixel.data[0] = 0;
                    pixel.data[1] = 0;
                    pixel.data[2] = 0;
                } else {
                    pixel.data[0] = 255;
                    pixel.data[1] = 255;
                    pixel.data[2] = 255;
                }
                context.putImageData(pixel, i, j);
            }
        }
    };

    const applyErosion = () => {
        const filteredImage = [];
        for (let i = 0; i < canvas.width; i++) {
            filteredImage[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                filteredImage[i][j] = isAnyNeighboringPixelWhite(i, j);
            }
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                if (filteredImage[i][j]) {
                    pixel.data[0] = 255;
                    pixel.data[1] = 255;
                    pixel.data[2] = 255;
                } else {
                    pixel.data[0] = 0;
                    pixel.data[1] = 0;
                    pixel.data[2] = 0;
                }
                context.putImageData(pixel, i, j);
            }
        }
    };

    const applyMorphologicalOpening = () => {
        const erosionImage = [];
        for (let i = 0; i < canvas.width; i++) {
            erosionImage[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                erosionImage[i][j] = isAnyNeighboringPixelBlack(i, j);
            }
        }
        const dilationImage = [];
        for (let i = 0; i < canvas.width; i++) {
            dilationImage[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                dilationImage[i][j] = checkNeigbhoringIndexes(erosionImage, i, j);
            }
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                if (dilationImage[i][j]) {
                    pixel.data[0] = 0;
                    pixel.data[1] = 0;
                    pixel.data[2] = 0;
                } else {
                    pixel.data[0] = 255;
                    pixel.data[1] = 255;
                    pixel.data[2] = 255;
                }
                context.putImageData(pixel, i, j);
            }
        }
    };

    const applyMorphologicalClosing = () => {
        const dilationImage = [];
        for (let i = 0; i < canvas.width; i++) {
            applyMorphologicalClosing[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                applyMorphologicalClosing[i][j] = isAnyNeighboringPixelWhite(i, j);
            }
        }
        const erosionImage = [];
        for (let i = 0; i < canvas.width; i++) {
            erosionImage[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                erosionImage[i][j] = checkNeigbhoringIndexes(applyMorphologicalClosing, i, j);
            }
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                if (erosionImage[i][j]) {
                    pixel.data[0] = 255;
                    pixel.data[1] = 255;
                    pixel.data[2] = 255;
                } else {
                    pixel.data[0] = 0;
                    pixel.data[1] = 0;
                    pixel.data[2] = 0;
                }
                context.putImageData(pixel, i, j);
            }
        }
    };

    const hitOrMissPatterns = [[[0, 1, 0], [-1, 1, 1], [-1, -1, 0]], [[-1, -1, 0], [-1, 1, 1], [0, 1, 0]], [[0, -1, -1], [1, 1, -1], [0, 1, 0]], [[0, 1, 0], [1, 1, -1], [0, -1, -1]]];

    const checkHitOrMissPattern = (x, y) => {
        let fits;
        for (let k = 0; k < 4; k++) {
            const hitOrMissPattern = hitOrMissPatterns[k];
            fits = true;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const [ R, G, B ] = context.getImageData(x + i - 1, y + j - 1, 1, 1).data;
                    if (hitOrMissPattern[i][j] === 1) {
                        if (R !== 255 || G !== 255 || B !== 255) {
                            fits = false;
                        }
                    } else if (hitOrMissPattern[i][j] === -1) {
                        if (R !== 0 || G !== 0 || B !== 0) {
                            fits = false;
                        }
                    }
                }
            }
            if (fits) {
                return true;
            }
        }
        return false;
    };

    const applyHitOrMiss = () => {
        const edges = [];
        for (let i = 0; i < canvas.width; i++) {
            edges[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                edges[i][j] = checkHitOrMissPattern(i, j);
            }
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                const [ R, G, B ] = pixel.data;
                if (R === 255 && G === 255 && B === 255) {
                    if (edges[i][j]) {
                        pixel.data[0] = 0;
                        pixel.data[1] = 0;
                        pixel.data[2] = 0;
                        context.putImageData(pixel, i, j);
                    }
                }
            }
        }
    };

});

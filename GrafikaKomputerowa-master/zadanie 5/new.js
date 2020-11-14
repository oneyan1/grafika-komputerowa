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

    $("#binarization-entropy-selection").click(() => {
        const entropyThreshold = $("#entropy-threshold").val();
        entropySelection(entropyThreshold);
    });

    $("#binarization-otsu-method").click(() => {
        OtsuMethod();
    });

    $("#binarization-niblack-method").click(() => {
        NiblackMethod();
    });

    $("#adaptive-threshold").click(() => {
        adaptiveThreshold();
    });

    const updateExtensionLUT = (a, b, LUT) => {
        for (let i = 0; i < 256; i++) {
            if ((a * (i + b)) > 255) {
                LUT[i] = 255;
            } else if ((a * (i + b)) < 0) {
                LUT[i] = 0;
            } else {
                LUT[i] = (a * (i + b));
            }
        }
    };

    const updateEqualizationLUT = (array, LUT) => {
        let i = 0;
        let D0min;
        while (array[i] == 0){
            i++;
        }
        D0min = array[i];
        for (i = 0; i < 256; i++) {
            LUT[i] = (((array[i] - D0min) / (1 - D0min)) * (256 - 1));
        }
    };

    const getMinMaxValues = () => {
        let Rmin, Gmin, Bmin, Rmax, Gmax, Bmax;
        Rmin = Gmin = Bmin = 255;
        Rmax = Gmax = Bmax = 0;
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const [
                    r,
                    g,
                    b
                ] = context.getImageData(i, j, 1, 1).data;
                if (r < Rmin) {
                    Rmin = r;
                }
                if (g < Gmin) {
                    Gmin = g;
                }
                if (b < Bmin) {
                    Bmin = b;
                }
                if (r > Rmax) {
                    Rmax = r;
                }
                if (g > Gmax) {
                    Gmax = g;
                }
                if (b > Bmax) {
                    Bmax = b;
                }
            }
        }
        return {
            Rmin,
            Gmin,
            Bmin,
            Rmax,
            Gmax,
            Bmax
        };
    };

    const createGrayscaleHistogram = () => {
        const grayscaleArray = [];
        const grayscalePixels = [];
        const numberOfPixels = canvas.width * canvas.height;
        for (let i = 0; i < 256; i++) {
            grayscaleArray[i] = 0;
        }
        for (let i = 0; i < canvas.width; i++) {
            grayscalePixels[i] = [];
            for (let j = 0; j < canvas.height; j++) {
                const [
                    r,
                    g,
                    b
                ] = context.getImageData(i, j, 1, 1).data;
                const pixelGrayscale = Math.round((0.299 * r + 0.587 * g + 0.114 * b));
                grayscalePixels[i][j] = pixelGrayscale;
                grayscaleArray[pixelGrayscale]++;
            }
        }
        const grayscaleProbability = [];
        for (let i = 0; i < 256; i++) {
            grayscaleProbability[i] = grayscaleArray[i] / numberOfPixels;
        }
        return {
            grayscaleArray,
            grayscalePixels,
            grayscaleProbability
        };
    };

    const entropySelection = (thresholdValue) => {
        const {
            grayscalePixels,
            grayscaleProbability
        } = createGrayscaleHistogram();
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                let entropy = 0;
                for (let k = 0; k < 256; k++) {
                    entropy += grayscaleProbability[grayscalePixels[i][j]] * Math.log2(grayscaleProbability[grayscalePixels[i][j]]);
                }
                entropy *= -1;
                if (entropy <= thresholdValue) {
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

    const OtsuMethod = () => {
        const {
            grayscalePixels,
            grayscaleProbability
        } = createGrayscaleHistogram();

        let max = 0;
        let t = 0;

        for (let k = 0; k < 256; k++) {

            const thresholdValue = k;

            let objectMean = 0;
            let backgroundMean = 0;
    
            let objectProbability = 0;
            let backgroundProbability = 0;
    
            for (let i = 0; i <= thresholdValue; i++) {
                objectProbability += grayscaleProbability[i];
            }
            for (let i = thresholdValue + 1; i < 256; i++) {
                backgroundProbability += grayscaleProbability[i];
            }
    
            for (let i = 0; i <= thresholdValue; i++) {
                objectMean += i * grayscaleProbability[i] / objectProbability;
            }
            for (let i = thresholdValue + 1; i < 256; i++) {
                backgroundMean += i * grayscaleProbability[i] / backgroundProbability;
            }

            let objectVariation = 0;
            let backgroundVariation = 0;
    
            for (let i = 0; i <= thresholdValue; i++) {
                objectVariation += Math.pow(i - objectMean, 2) * (grayscaleProbability[i] / objectProbability);
            }
            for (let i = thresholdValue + 1; i < 256; i++) {
                backgroundVariation += Math.pow(i - backgroundMean, 2) * (grayscaleProbability[i] / backgroundProbability);
            }
    
            let globalMean = 0;
            let globalVariation = 0;
    
            for (let i = 0; i < 256; i++) {
                globalMean += i * grayscaleProbability[i];
            }
    
            for (let i = 0; i < 256; i++) {
                globalVariation += Math.pow(i - globalMean, 2) * grayscaleProbability[i];
            }

            const variation = objectProbability * backgroundProbability * Math.pow((objectMean * backgroundMean), 2);
            console.log(variation);

            if (variation > max) {
                max = variation;
                t = k;
            }
        }

        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                if (grayscalePixels[i][j] <= t) {
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

    const adaptiveThreshold = () => {
        const { grayscalePixels } = createGrayscaleHistogram();
        const filteredImage = [];

        for (let i = 0; i < canvas.width; i++) {
            filteredImage[i] = [].fill(false);
            for (let j = 0; j < canvas.height; j++) {
                if (i > 0 && j > 0 && i < canvas.width - 1 && j < canvas.height - 1) {
                    const average = (grayscalePixels[i-1][j-1] + grayscalePixels[i-1][j] + grayscalePixels[i-1][j+1] + grayscalePixels[i][j-1] + grayscalePixels[i][j] + grayscalePixels[i][j+1] + grayscalePixels[i+1][j-1] + grayscalePixels[i+1][j] + grayscalePixels[i+1][j+1]) / 9;
                    if (grayscalePixels[i][j] > average + 5) {
                        filteredImage[i][j] = true;
                    }
                }
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

    const NiblackMethod = () => {
        const { grayscalePixels } = createGrayscaleHistogram();
        const filteredImage = [];

        for (let i = 0; i < canvas.width; i++) {
            filteredImage[i] = [].fill(false);
            for (let j = 0; j < canvas.height; j++) {
                if (i > 0 && j > 0 && i < canvas.width - 1 && j < canvas.height - 1) {
                    const average = (grayscalePixels[i-1][j-1] + grayscalePixels[i-1][j] + grayscalePixels[i-1][j+1] + grayscalePixels[i][j-1] + grayscalePixels[i][j] + grayscalePixels[i][j+1] + grayscalePixels[i+1][j-1] + grayscalePixels[i+1][j] + grayscalePixels[i+1][j+1]) / 9;
                    const standardDeviation = Math.sqrt((
                        Math.pow(average - grayscalePixels[i-1][j-1], 2) +
                        Math.pow(average - grayscalePixels[i-1][j], 2) +
                        Math.pow(average - grayscalePixels[i-1][j+1], 2) +
                        Math.pow(average - grayscalePixels[i][j-1], 2) +
                        Math.pow(average - grayscalePixels[i][j], 2) +
                        Math.pow(average - grayscalePixels[i][j+1], 2) +
                        Math.pow(average - grayscalePixels[i+1][j-1], 2) +
                        Math.pow(average - grayscalePixels[i+1][j], 2) +
                        Math.pow(average - grayscalePixels[i+1][j+1], 2)) / 9
                    );
                    const threshold = average + standardDeviation * 0.2;
                    if (grayscalePixels[i][j] > threshold) {
                        filteredImage[i][j] = true;
                    }
                }
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

    $("#reset").click(() => {
        handleFile(loadedFile);
    });

});

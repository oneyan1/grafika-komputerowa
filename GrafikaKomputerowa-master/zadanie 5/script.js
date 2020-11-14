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

    $("#extend").click(() => {
        extendHistogram();
    });

    $("#equalize").click(() => {
        equalizeHistogram();
    });

    $("#binarization-one").click(() => {
        const edgeNumber = $("#binarization-number").val();
        binarizeImage(edgeNumber);
    });

    $("#binarization-two").click(() => {
        binarizeByPercentBlackSelection();
    });

    $("#binarization-three").click(() => {
        binarizeByMeanIterativeSelection();
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
        const numberOfPixels = canvas.width * canvas.height;
        for (let i = 0; i < 256; i++) {
            grayscaleArray[i] = 0;
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const [
                    r,
                    g,
                    b
                ] = context.getImageData(i, j, 1, 1).data;
                const pixelGrayscale = Math.round((0.299 * r + 0.587 * g + 0.114 * b));
                grayscaleArray[pixelGrayscale]++;
            }
        }
        const grayscaleProbability = [];
        for (let i = 0; i < 256; i++) {
            grayscaleProbability[i] = grayscaleArray[i] / numberOfPixels;
        }
        return {
            grayscaleArray,
            grayscaleProbability
        };
    };

    const extendHistogram = () => {
        const {
            Rmin,
            Gmin,
            Bmin,
            Rmax,
            Gmax,
            Bmax
        } = getMinMaxValues();
        const LUTR = [];
        const LUTG = [];
        const LUTB = [];
        if (Rmin !== Rmax) {
            updateExtensionLUT(255 / (Rmax - Rmin), -1 * Rmin, LUTR);
        }
        if (Gmin !== Gmax) {
            updateExtensionLUT(255 / (Gmax - Gmin), -1 * Gmin, LUTG);
        }
        if (Bmin !== Bmax) {
            updateExtensionLUT(255 / (Bmax - Bmin), -1 * Bmin, LUTB);
        }
        for (let i = 0; i < canvas. width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                pixel.data[0] = LUTR[pixel.data[0]];
                pixel.data[1] = LUTG[pixel.data[1]];
                pixel.data[2] = LUTB[pixel.data[2]];
                context.putImageData(pixel, i, j);
            }
        }
    };

    const equalizeHistogram = () => {
        const r = [];
        const g = [];
        const b = [];
        const Dr = [];
        const Dg = [];
        const Db = [];
        for (let i = 0; i < 256; i++) {
            r[i] = 0;
            g[i] = 0;
            b[i] = 0;
            Dr[i] = 0;
            Dg[i] = 0;
            Db[i] = 0;
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const [
                    R,
                    G,
                    B
                ] = context.getImageData(i, j, 1, 1).data;

                r[R]++;
                g[G]++;
                b[B]++;
            }
        }
        const numberOfPixels = (canvas.width) * (canvas.height);
        let sumR = sumG = sumB = 0;
        for (let i = 0; i < 256; i++) {
            sumR += (r[i]/numberOfPixels);
            sumG += (g[i]/numberOfPixels);
            sumB += (b[i]/numberOfPixels);
            Dr[i] += sumR;
            Dg[i] += sumG;
            Db[i] += sumB;
        }
        const LUTR = [];
        const LUTG = [];
        const LUTB = [];
        updateEqualizationLUT(Dr, LUTR);
        updateEqualizationLUT(Dg, LUTG);
        updateEqualizationLUT(Db, LUTB);
        for (let i = 0; i < 256; i++) {
            r[i] = 0;
            g[i] = 0;
            b[i] = 0;
        }
        for (i = 0; i < canvas.width; i++) {
            for (j = 0; j < canvas.width; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                pixel.data[0] = LUTR[pixel.data[0]];
                pixel.data[1] = LUTG[pixel.data[1]];
                pixel.data[2] = LUTB[pixel.data[2]];
                context.putImageData(pixel, i, j);
                r[pixel.data[0]]++;
                g[pixel.data[1]]++;
                b[pixel.data[2]]++;
            }
        }
    };

    const binarizeImage = (grayscaleValue) => {
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                const [
                    r,
                    g,
                    b
                ] = pixel.data;
                const gray = (0.299 * r + 0.587 * g + 0.114 * b);
                if (gray > grayscaleValue) {
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

    const binarizeByPercentBlackSelection = () => {
        const {
            grayscaleArray
        } = createGrayscaleHistogram();
        const numberOfPixels = canvas.width * canvas.height;
        let grayscaleValue = -1;
        let sum = 0;
        while (sum < numberOfPixels * 0.1) {
            grayscaleValue++;
            sum += grayscaleArray[grayscaleValue];
        }
        if (grayscaleValue < 0) grayscaleValue = 0;
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                const [
                    r,
                    g,
                    b
                ] = pixel.data;
                const pixelGrayscale = (0.299 * r + 0.587 * g + 0.114 * b);
                if (pixelGrayscale > grayscaleValue) {
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

    const binarizeByMeanIterativeSelection = () => {
        let thresholdValue = 100;
        let meanOne = thresholdValue;
        let meanTwo = thresholdValue;
        let done = false;
        while (!done) {
            let partitionOneCount, partitionTwoCount, partitionOneSum, partitionTwoSum;
            partitionOneCount = partitionTwoCount = partitionOneSum = partitionTwoSum = 0;
            for (let i = 0; i < canvas.width; i++) {
                for (let j = 0; j < canvas.height; j++) {
                    const pixel = context.getImageData(i, j, 1, 1);
                    const [
                        r,
                        g,
                        b
                    ] = pixel.data;
                    const pixelGrayscale = (0.299 * r + 0.587 * g + 0.114 * b);
                    if (pixelGrayscale < thresholdValue) {
                        partitionOneCount++;
                        partitionOneSum += pixelGrayscale;
                    } else {
                        partitionTwoCount++;
                        partitionTwoSum += pixelGrayscale;
                    }
                }
            }
            const partitionOneMean = partitionOneSum / partitionOneCount;
            const partitionTwoMean = partitionTwoSum / partitionTwoCount;
            if (meanOne === partitionOneMean && meanTwo === partitionTwoMean) {
                done = true;
                break;
            } else {
                meanOne = partitionOneMean;
                meanTwo = partitionTwoMean;
                thresholdValue = (meanOne + meanTwo) / 2;
            }
        }
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                const [
                    r,
                    g,
                    b
                ] = pixel.data;
                const pixelGrayscale = (0.299 * r + 0.587 * g + 0.114 * b);
                if (pixelGrayscale > thresholdValue) {
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

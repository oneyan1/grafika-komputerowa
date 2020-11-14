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

    $("#button-add").click(() => {
        const rgbColor = $("#rgb-color").val();
        const hexColorRegex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        if (hexColorRegex.test(rgbColor)) {
            addColor(rgbColor.replace("#", ""));
        } else {
            alert("Enter valid RGB value");
        }
    });

    $("#button-subtract").click(() => {
        const rgbColor = $("#rgb-color").val();
        const hexColorRegex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        if (hexColorRegex.test(rgbColor)) {
            subtractColor(rgbColor.replace("#", ""));
        } else {
            alert("Enter valid RGB value");
        }
    });

    $("#button-multiply").click(() => {
        const rgbColor = $("#rgb-color").val();
        const hexColorRegex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        if (hexColorRegex.test(rgbColor)) {
            multiplyByColor(rgbColor.replace("#", ""));
        } else {
            alert("Enter valid RGB value");
        }
    });

    $("#button-divide").click(() => {
        const rgbColor = $("#rgb-color").val();
        const hexColorRegex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        if (hexColorRegex.test(rgbColor)) {
            divideByColor(rgbColor.replace("#", ""));
        } else {
            alert("Enter valid RGB value");
        }
    });

    $("#button-grayscale-1").click(() => {
        grayscaleAverage();
    });

    $("#button-grayscale-2").click(() => {
        grayscaleLightness();
    });

    $("#button-grayscale-3").click(() => {
        grayscaleLuminosity();
    });


    $("#reset").click(() => {
        handleFile(loadedFile);
    });

    const addColor = color => {
        const addRGB = color.replace("#", "");
        const addR = parseInt(addRGB.substr(0,2), 16);
        const addG = parseInt(addRGB.substr(2,2), 16);
        const addB = parseInt(addRGB.substr(4,2), 16);
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixelData = context.getImageData(i, j, 1, 1);
                pixelData.data[0] = pixelData.data[0] + addR <= 255 ? pixelData.data[0] + addR : 255;
                pixelData.data[1] = pixelData.data[1] + addG <= 255 ? pixelData.data[0] + addG : 255;
                pixelData.data[2] = pixelData.data[2] + addB <= 255 ? pixelData.data[0] + addB : 255;
                context.putImageData(pixelData, i, j);
            }
        }
    };

    const subtractColor = color => {
        const subtractRGB = color.replace("#", "");
        const subtractR = parseInt(subtractRGB.substr(0,2), 16);
        const subtractG = parseInt(subtractRGB.substr(2,2), 16);
        const subtractB = parseInt(subtractRGB.substr(4,2), 16);
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixelData = context.getImageData(i, j, 1, 1);
                pixelData.data[0] = pixelData.data[0] - subtractR >= 0 ? pixelData.data[0] - subtractR : 0;
                pixelData.data[1] = pixelData.data[1] - subtractG >= 0 ? pixelData.data[1] - subtractG : 0;
                pixelData.data[2] = pixelData.data[2] - subtractB >= 0 ? pixelData.data[2] - subtractB : 0;
                context.putImageData(pixelData, i, j);
            }
        }
    };

    const multiplyByColor = color => {
        const multiplyRGB = color.replace("#", "");
        const multiplyR = parseInt(multiplyRGB.substr(0,2), 16);
        const multiplyG = parseInt(multiplyRGB.substr(2,2), 16);
        const multiplyB = parseInt(multiplyRGB.substr(4,2), 16);
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                pixel.data[0] = Math.round((pixel.data[0] * multiplyR) / 255);
                pixel.data[1] = Math.round((pixel.data[1] * multiplyG) / 255);
                pixel.data[2] = Math.round((pixel.data[2] * multiplyB) / 255);
                context.putImageData(pixel, i, j);
            }
        }
    };

    const divideByColor = color => {
        const divideRGB = color.replace("#", "");
        const divideR = parseInt(divideRGB.substr(0,2), 16);
        const divideG = parseInt(divideRGB.substr(2,2), 16);
        const divideB = parseInt(divideRGB.substr(4,2), 16);
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                pixel.data[0] = Math.round((pixel.data[0] / divideR) * 255);
                pixel.data[1] = Math.round((pixel.data[1] / divideG) * 255);
                pixel.data[2] = Math.round((pixel.data[2] / divideB) * 255);
                context.putImageData(pixel, i, j);
            }
        }
    };


    const grayscaleAverage = () => {
        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                const pixel = context.getImageData(i, j, 1, 1);
                const grayColor = Math.round((pixel.data[0] + pixel.data[1] + pixel.data[2]) / 3);
                pixel.data[0] = pixel.data[1] = pixel.data[2] = grayColor;
                context.putImageData(pixel, i, j);
            }
        } 
    };

});

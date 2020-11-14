$(() => {

    $("#rgb-button-text").click(() => {
        const rgbColor = $("#rgb-text").val();
        const rgbColorRegex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        if (rgbColorRegex.test(rgbColor)) {
            const cmyk = convertRGB(rgbColor.replace("#", ""));
            const {
                C,
                M,
                Y,
                K
            } = cmyk;
            $("div#rgb-color-text").css("background", rgbColor);
            $("span#span-rgb-text").html(`
                RGB color (hex): ${rgbColor}<br>
                CMYK color: (${C}%, ${M}%, ${Y}%, ${K}%)
            `);
        } else {
            alert("Please enter correct hexadecimal color!");
            return;
        }
    });

    $("#rgb-button-numbers").click(() => {
        let r = parseInt($("#rgb-number-r").val()).toString(16);
        let g = parseInt($("#rgb-number-g").val()).toString(16);
        let b = parseInt($("#rgb-number-b").val()).toString(16);
        if (r.length === 1) {
            r = `0${r}`;
        }
        if (g.length === 1) {
            g = `0${g}`;
        }
        if (b.length === 1) {
            b = `0${b}`;
        }
        const rgbColor = `#${r}${g}${b}`;
        const hexColorRegex = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
        if (hexColorRegex.test(rgbColor)) {
            const cmyk = convertRGB(rgbColor.replace("#", ""));
            const {
                C,
                M,
                Y,
                K
            } = cmyk;
            $("div#rgb-color-numbers").css("background", rgbColor);
            $("span#span-rgb-numbers").html(`
                RGB color (hex): ${rgbColor}<br>
                CMYK color: (${C}%, ${M}%, ${Y}%, ${K}%)
            `);
        } else {
            alert("Please enter correct hexadecimal color!");
        }
    });

    $("#cmyk-button").click(() => {
        const C = $("#cmyk-slider-c").val();
        const M = $("#cmyk-slider-m").val();
        const Y = $("#cmyk-slider-y").val();
        const K = $("#cmyk-slider-k").val();
        const cmyk = {
            C,
            M,
            Y,
            K
        };
        const rgbColor = convertCMYK(cmyk);
        $("div#cmyk-color").css("background", rgbColor);
        $("span#span-cmyk").html(`
            RGB color (hex): ${rgbColor}<br>
            CMYK color: (${C}%, ${M}%, ${Y}%, ${K}%)
        `);
    });

});

const convertRGB = (rgb) => {
    let R = parseInt(rgb.substr(0,2), 16) / 255;
    let G = parseInt(rgb.substr(2,2), 16) / 255;
    let B = parseInt(rgb.substr(4,2), 16) / 255;
    let K = 1 - Math.max(R, G, B);
    const C = Math.round(100 * (1 - R - K) / (1 - K));
    const M = Math.round(100 * (1 - G - K) / (1 - K));
    const Y = Math.round(100 * (1 - B - K) / (1 - K));
    K = Math.round(100 * K);
    return {
        C,
        M,
        Y,
        K
    }
};

const convertCMYK = (cmyk) => {
    const {
        C,
        M,
        Y,
        K
    } = cmyk;
    let R = (Math.round(255 * ( 1 - C / 100 ) * ( 1 - K / 100 ))).toString(16);
    let G = (Math.round(255 * ( 1 - M / 100 ) * ( 1 - K / 100 ))).toString(16);
    let B = (Math.round(255 * ( 1 - Y / 100 ) * ( 1 - K / 100 ))).toString(16);
    if (R.length === 1) {
        R = `0${R}`;
    }
    if (G.length === 1) {
        G = `0${G}`;
    }
    if (B.length === 1) {
        B = `0${B}`;
    }
    return `#${R}${G}${B}`;
};

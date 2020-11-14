class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let canvas, context, posX, poxY, width, height;

let start = new Point(-1, -1);
let finish = new Point(-1, -1);

let clickedPoints = [];

const steps = 1000;

let mouseDown = false;
let changingPointIndex = -1;

const comparePoints = (A, B) => {
    return Math.abs(A.x - B.x) <= 5 && Math.abs(A.y - B.y) <= 5;
};

$(() => {

    context = document.getElementById("canvas").getContext("2d");
    
    posX = $("#canvas").position().left;
    posY = $("#canvas").position().top;

    context.fillStyle = "white";

    width = context.canvas.width;
    height = context.canvas.height;

    start = new Point(200, 200);
    finish = new Point(400, 200);

    let clicks = 3;
    let clicksCounter = 0;

    const factorial = (number) => {
        number = parseInt(number, 10);
        if (isNaN(number)) return 1;
        if (number <= 0) return 1;
        if (number > 170) return Infinity;
        let result = 1
        for (let i = number; i > 0; i--){
            result *= i;
        }
        return result;
    };

    const drawBezierCurve = () => {
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < clicks; i++) {
            context.beginPath();
            if (i === 0 || i === clicks - 1) {
                context.fillStyle = "#ff0000";
                context.arc(clickedPoints[i].x, clickedPoints[i].y, 5, 0,2 * Math.PI);
            } else {
                context.fillStyle = "#ff8080";
                context.arc(clickedPoints[i].x, clickedPoints[i].y, 3, 0,2 * Math.PI);
            }
            context.fill();
        }
        context.fillStyle = "#ffffff";
        for (let i = 0; i <= steps; i++) {
            let a = 0;
            let b = 0;
            for (let j = 0; j < clicks; j++) {
                a += (factorial(clicks - 1) / (factorial(j) * factorial(clicks - 1 - j))) * Math.pow((1 - i / steps), clicks - 1 - j) * Math.pow(i / steps, j) * clickedPoints[j].x;
                b += (factorial(clicks - 1) / (factorial(j) * factorial(clicks - 1 - j))) * Math.pow((1 - i / steps), clicks - 1 - j) * Math.pow(i / steps, j) * clickedPoints[j].y;
            }
            context.fillRect(a, b, 1, 1);
        }
    };

    $("#canvas").click((event) => {
        if (clicksCounter < clicks) {
            const x = event.pageX - posX;
            const y = event.pageY - posY;
            clickedPoints[clicksCounter] = new Point(x, y);
            context.beginPath();
            if (clicksCounter === 0 || clicksCounter === clicks - 1) {
                context.fillStyle = "#ff0000";
                context.arc(x, y, 5, 0,2 * Math.PI);
            } else {
                context.fillStyle = "#ff8080";
                context.arc(x, y, 3, 0,2 * Math.PI);
            }
            context.fill();
            clicksCounter += 1;
        }
        if (clicksCounter === clicks) {
            drawBezierCurve();
        }
    });

    $("#canvas").mousedown((event) => {
        if (clicksCounter === clicks) {
            const x = event.pageX - posX;
            const y = event.pageY - posY;
            const point = new Point(x, y);
            for (let i = 0; i < clicks; i++) {
                if (comparePoints(point, clickedPoints[i])) {
                    mouseDown = true;
                    changingPointIndex = i;
                    $("#edit-x").val(clickedPoints[i].x);
                    $("#edit-y").val(clickedPoints[i].y);
                    break;
                }
            }
        }
    });

    $("#canvas").mouseup((event) => {
        if (clicksCounter === clicks && changingPointIndex >= 0) {
            const x = event.pageX - posX;
            const y = event.pageY - posY;
            clickedPoints[changingPointIndex] = new Point(x, y);
            drawBezierCurve();
        }
        mouseDown = false;
    });

    $("#canvas").mousemove((event) => {
        if (clicksCounter === clicks && mouseDown === true && changingPointIndex >= 0) {
            const x = event.pageX - posX;
            const y = event.pageY - posY;
            clickedPoints[changingPointIndex] = new Point(x, y);
            drawBezierCurve();
        }
    });

    $("#control-points").change((event) => {
        clicks = parseInt(event.target.value);
    });

    $("#coords").click(() => {
        if (changingPointIndex >= 0) {
            const x = $("#edit-x").val();
            const y = $("#edit-y").val();
            clickedPoints[changingPointIndex] = new Point(x, y);
            drawBezierCurve();
            changingPointIndex = -1;
        }
    });

    $("#reset").click(() => {
        context.clearRect(0, 0, width, height);
        clickedPoints = [];
        clicksCounter = 0;
    });

});

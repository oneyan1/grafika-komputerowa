class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Line {
    constructor(A, B) {
        this.A = A;
        this.B = B;
    }
}


class Rectangle {
    constructor(A, B) {
        this.A = A;
        this.B = B;
    }
}


class Circle {
    constructor(O, radius) {
        this.O = O;
        this.radius = radius;
    }
}


let activeTool = "drawing";
let activeFigure = "line";

let mouseDown = false;

let lines = [];
let rectangles = [];
let circles = [];

let canvas, context, posX, poxY, width, height;

let A = new Point(-1, -1);
let B = new Point(-1, -1);

let movingObjectIndex = -1;

let resizingObjectIndex = -1;
let resizingLinePoint = "";

let changingObjectIndex = -1;

$(() => {

    context = document.getElementById("canvas").getContext("2d");
    
    posX = $("#canvas").position().left;
    posY = $("#canvas").position().top;

    context.strokeStyle = "white";

    width = context.canvas.width;
    height = context.canvas.height;

    refreshForms();
    
    $("#canvas").mousedown((event) => {
        const x = event.pageX - posX;
        const y = event.pageY - posY;
        A = new Point(x, y);
        mouseDown = true;
        if (activeTool === "drawing") {
        } else if (activeTool === "moving") {
            if (activeFigure === "line") {
                for (let i = 0; i < lines.length; i++) {
                    console.log(lines[i]);
                    const line = lines[i];
                    const {
                        A: lineA,
                        B: lineB
                    } = line;
                    const a = (lineA.y - lineB.y) / (lineA.x - lineB.x);
                    const b = lineA.y - (((lineA.y - lineB.y) / (lineA.x - lineB.x)) * lineA.x);
                    if ((Math.abs(A.x - line.A.x) <= 5 && Math.abs(A.y - line.A.y) <= 5) || (Math.abs(A.x - line.B.x) <= 5 && Math.abs(A.y - line.B.y) <= 5)) {
                        movingObjectIndex = i;
                        return;
                    }
                    if ((Math.abs(a * A.x - A.y + b) / Math.sqrt(Math.pow(a, 2) + Math.pow(-1, 2))) <= 5) {
                        if (lineA.x < lineB.x) {
                            if (lineA.y < lineB.y) {
                                if (A.x > lineA.x -5 && A.x < lineB.x + 5 && A.y > lineA.y -5 && A.y < lineB.y + 5) {
                                    movingObjectIndex = i;
                                    return;
                                }
                            } else {
                                if (A.x > lineA.x -5 && A.x < lineB.x + 5 && A.y > lineB.y - 5 && A.y < lineA.y + 5) {
                                    movingObjectIndex = i;
                                    return;
                                }
                            }
                        } else {
                            if (lineA.y < lineB.y) {
                                if (A.x > lineB.x -5 && A.x < lineA.x + 5 && A.y > lineA.y - 5 && A.y < lineB.y + 5) {
                                    movingObjectIndex = i;
                                    return;
                                }
                            } else {
                                if (A.x > lineB.x -5 && A.x < lineA.x + 5 && A.y > lineB.y -5 && A.y < lineA.y + 5) {
                                    movingObjectIndex = i;
                                    return;
                                }
                            }
                        }
                    }
                }
            } else if (activeFigure === "rectangle") {
                for (let i = 0; i < rectangles.length; i++) {
                    const rectangle = rectangles[i];
                    const {
                        A: rectA,
                        B: rectB
                    } = rectangle;
                    if ((Math.abs(A.x - rectA.x) <= 5 && Math.abs(A.y - rectA.y) <= 5) || (Math.abs(A.x - rectA.x) <= 5 && Math.abs(A.y - rectB.y) <= 5) || (Math.abs(A.x - rectB.x) <= 5 && Math.abs(A.y - rectA.y) <= 5) || (Math.abs(A.x - rectB.x) <= 5 && Math.abs(A.y - rectB.y) <= 5)) {
                        movingObjectIndex = i;
                        return;
                    }
                    if ((A.x >= rectA.x - 5 && A.x <= rectB.x + 5 && Math.abs(A.y - rectA.y) <=5) ||
                    (A.x >= rectA.x - 5 && A.x <= rectB.x + 5 && Math.abs(A.y - rectB.y) <=5) ||
                    (A.y >= rectA.y - 5 && A.y <= rectB.y + 5 && Math.abs(A.x - rectA.x) <=5) ||
                    (A.y >= rectA.y - 5 && A.y <= rectB.y + 5 && Math.abs(A.x - rectB.x) <=5)) {
                        movingObjectIndex = i;
                        return;
                    }
                }
            } else if (activeFigure === "circle") {
                for (let i = 0; i < circles.length; i++) {
                    const circle = circles[i];
                    if (Math.abs((Math.sqrt(Math.pow(A.x - circle.O.x, 2) + Math.pow(A.y - circle.O.y, 2))) - circle.radius) <= 5) {
                        movingObjectIndex = i;
                        return;
                    }
                }
            }
        } else if (activeTool === "resizing") {
            if (activeFigure === "line") {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if ((Math.abs(A.x - line.A.x) <= 5 && Math.abs(A.y - line.A.y) <= 5)) {
                        resizingObjectIndex = i;
                        resizingLinePoint = "A";
                        return;
                    } else if ((Math.abs(A.x - line.B.x) <= 5 && Math.abs(A.y - line.B.y) <= 5)) {
                        resizingObjectIndex = i;
                        resizingLinePoint = "B";
                        return;
                    }
                }
            } else if (activeFigure === "rectangle") {
                for (let i = 0; i < rectangles.length; i++) {
                    const rectangle = rectangles[i];
                    if ((Math.abs(A.x - rectangle.A.x) <= 5 && Math.abs(A.y - rectangle.A.y) <= 5)) {
                        resizingObjectIndex = i;
                        A.x = rectangles[i].B.x;
                        A.y = rectangles[i].B.y;
                        return;
                    } else if(Math.abs(A.x - rectangle.A.x) <= 5 && Math.abs(A.y - rectangle.B.y) <= 5) {
                        resizingObjectIndex = i;
                        A.x = rectangles[i].B.x;
                        A.y = rectangles[i].A.y;
                        return;
                    } else if (Math.abs(A.x - rectangle.B.x) <= 5 && Math.abs(A.y - rectangle.A.y) <= 5) {
                        resizingObjectIndex = i;
                        A.x = rectangles[i].A.x;
                        A.y = rectangles[i].B.y;
                        return;
                    } else if (Math.abs(A.x - rectangle.B.x) <= 5 && Math.abs(A.y - rectangle.B.y) <= 5) {
                        resizingObjectIndex = i;
                        A.x = rectangles[i].A.x;
                        A.y = rectangles[i].A.y;
                        return;
                    }
                }
            } else if (activeFigure === "circle") {
                for (let i = 0; i < circles.length; i++) {
                    const circle = circles[i];
                    if (Math.abs((Math.sqrt(Math.pow(A.x - circle.O.x, 2) + Math.pow(A.y - circle.O.y, 2))) - circle.radius) <= 5) {
                        resizingObjectIndex = i;
                        return;
                    }
                }
            }
        } else if (activeTool === "changing") {
            if (activeFigure === "line") {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const {
                        A: lineA,
                        B: lineB
                    } = line;
                    const a = (lineA.y - lineB.y) / (lineA.x - lineB.x);
                    const b = lineA.y - (((lineA.y - lineB.y) / (lineA.x - lineB.x)) * lineA.x);
                    if ((Math.abs(A.x - line.A.x) <= 5 && Math.abs(A.y - line.A.y) <= 5) || (Math.abs(A.x - line.B.x) <= 5 && Math.abs(A.y - line.B.y) <= 5)) {
                        changingObjectIndex = i;
                    }
                    if ((Math.abs(a * A.x - A.y + b) / Math.sqrt(Math.pow(a, 2) + Math.pow(-1, 2))) <= 5) {
                        if (lineA.x < lineB.x) {
                            if (lineA.y < lineB.y) {
                                if (A.x > lineA.x -5 && A.x < lineB.x + 5 && A.y > lineA.y -5 && A.y < lineB.y + 5) {
                                    changingObjectIndex = i;
                                }
                            } else {
                                if (A.x > lineA.x -5 && A.x < lineB.x + 5 && A.y > lineB.y - 5 && A.y < lineA.y + 5) {
                                    changingObjectIndex = i;
                                }
                            }
                        } else {
                            if (lineA.y < lineB.y) {
                                if (A.x > lineB.x -5 && A.x < lineA.x + 5 && A.y > lineA.y - 5 && A.y < lineB.y + 5) {
                                    changingObjectIndex = i;
                                }
                            } else {
                                if (A.x > lineB.x -5 && A.x < lineA.x + 5 && A.y > lineB.y -5 && A.y < lineA.y + 5) {
                                    changingObjectIndex = i;
                                }
                            }
                        }
                    }
                }
            } else if (activeFigure === "rectangle") {
                for (let i = 0; i < rectangles.length; i++) {
                    const rectangle = rectangles[i];
                    const {
                        A: rectA,
                        B: rectB
                    } = rectangle;
                    if ((Math.abs(A.x - rectA.x) <= 5 && Math.abs(A.y - rectA.y) <= 5) || (Math.abs(A.x - rectA.x) <= 5 && Math.abs(A.y - rectB.y) <= 5) || (Math.abs(A.x - rectB.x) <= 5 && Math.abs(A.y - rectA.y) <= 5) || (Math.abs(A.x - rectB.x) <= 5 && Math.abs(A.y - rectB.y) <= 5)) {
                        changingObjectIndex = i;
                    }
                    if ((A.x >= rectA.x - 5 && A.x <= rectB.x + 5 && Math.abs(A.y - rectA.y) <=5) ||
                    (A.x >= rectA.x - 5 && A.x <= rectB.x + 5 && Math.abs(A.y - rectB.y) <=5) ||
                    (A.y >= rectA.y - 5 && A.y <= rectB.y + 5 && Math.abs(A.x - rectA.x) <=5) ||
                    (A.y >= rectA.y - 5 && A.y <= rectB.y + 5 && Math.abs(A.x - rectB.x) <=5)) {
                        changingObjectIndex = i;
                    }
                }
            } else if (activeFigure === "circle") {
                for (let i = 0; i < circles.length; i++) {
                    const circle = circles[i];
                    if (Math.abs((Math.sqrt(Math.pow(A.x - circle.O.x, 2) + Math.pow(A.y - circle.O.y, 2))) - circle.radius) <= 5) {
                        changingObjectIndex = i;
                    }
                }
            }
            updateChangingObject();
        }
    });
    
    $("#canvas").mouseup((event) => {
        if (mouseDown) {
            const x = event.pageX - posX;
            const y = event.pageY - posY;
            B = new Point(x, y);
            if (activeTool === "drawing") {
                if (A.x !== B.x && A.y !== B.y) {
                    if (activeFigure === "line") {
                        const line = new Line(A, B);
                        lines.push(line);
                        drawLine(line);
                    } else if (activeFigure === "rectangle") {
                        const rectangle = new Rectangle(new Point(Math.min(A.x, B.x), Math.min(A.y, B.y)), new Point(Math.max(A.x, B.x), Math.max(A.y, B.y)));
                        rectangles.push(rectangle);
                        drawRectangle(rectangle);
                    } else if (activeFigure === "circle") {
                        const radius = Math.abs(A.x - B.x) > Math.abs(A.y - B.y) ? Math.abs(A.y - B.y) / 2 : Math.abs(A.x - B.x) / 2;
                        let O;
                        if (A.x < B.x && A.y < B.y) {
                            O = new Point(A.x + radius, A.y + radius);
                        } else if (A.x > B.x && A.y > B.y) {
                            O = new Point(A.x - radius, A.y - radius);
                        } else if (A.x < B.x && A.y > B.y) {
                            O = new Point(A.x + radius, A.y - radius);
                        } else if (A.x > B.x && A.y < B.y) {
                            O = new Point(A.x - radius, A.y + radius);
                        }
                        const circle = new Circle(O, radius);
                        circles.push(circle);
                        drawCircle(circle);
                    }
                }
                mouseDown = false;
            } else if (activeTool === "moving") {
                if (movingObjectIndex !== -1) {
                    if (activeFigure === "line") {
                        const newLine = lines[movingObjectIndex];
                        newLine.A.x += (B.x - A.x);
                        newLine.A.y += (B.y - A.y);
                        newLine.B.x += (B.x - A.x);
                        newLine.B.y += (B.y - A.y);
                        lines[movingObjectIndex] = newLine;
                    } else if (activeFigure === "rectangle") {
                        const newRectangle = rectangles[movingObjectIndex];
                        newRectangle.A.x += (B.x - A.x);
                        newRectangle.A.y += (B.y - A.y);
                        newRectangle.B.x += (B.x - A.x);
                        newRectangle.B.y += (B.y - A.y);
                        rectangles[movingObjectIndex] = newRectangle;
                    }
                    refreshCanvas();
                }
            } else if (activeTool === "resizing") {
                if (resizingObjectIndex !== -1) {
                    if (activeFigure === "line") {
                        if (resizingLinePoint === "A") {
                            lines[resizingObjectIndex].A = B;
                        } else if (resizingLinePoint === "B") {
                            lines[resizingObjectIndex].B = B;
                        }
                    } else if (activeFigure === "rectangle") {
                        rectangles[resizingObjectIndex].A.x = A.x;
                        rectangles[resizingObjectIndex].A.y = A.y;
                        rectangles[resizingObjectIndex].B = B;
                    } else if (activeFigure === "circle") {

                    }
                    refreshCanvas();
                }
            }
        }
        movingObjectIndex = -1;
        resizingObjectIndex = -1;
    });

    $("#canvas").mousemove((event) => {
        if (mouseDown === true) {
            const x = event.pageX - posX;
            const y = event.pageY - posY;
            B = new Point(x, y);
            if (activeTool === "drawing") {
                refreshCanvas();
                if (activeFigure === "line") {
                    drawLine(new Line(A, B));
                } else if (activeFigure === "rectangle") {
                    drawRectangle(new Rectangle(new Point(Math.min(A.x, B.x), Math.min(A.y, B.y)), new Point(Math.max(A.x, B.x), Math.max(A.y, B.y))));
                } else if (activeFigure === "circle") {
                    const radius = Math.abs(A.x - B.x) > Math.abs(A.y - B.y) ? Math.abs(A.y - B.y) / 2 : Math.abs(A.x - B.x) / 2;
                    let O;
                    if (A.x < B.x && A.y < B.y) {
                        O = new Point(A.x + radius, A.y + radius);
                        drawCircle(new Circle(O, radius));
                    } else if (A.x > B.x && A.y > B.y) {
                        O = new Point(A.x - radius, A.y - radius);
                        drawCircle(new Circle(O, radius));
                    } else if (A.x < B.x && A.y > B.y) {
                        O = new Point(A.x + radius, A.y - radius);
                        drawCircle(new Circle(O, radius));
                    } else if (A.x > B.x && A.y < B.y) {
                        O = new Point(A.x - radius, A.y + radius);
                        drawCircle(new Circle(O, radius));
                    }
                }
            } else if (activeTool === "moving") {
                if (movingObjectIndex !== -1) {
                    if (activeFigure === "line") {
                        const newLine = lines[movingObjectIndex];
                        newLine.A.x += (B.x - A.x);
                        newLine.A.y += (B.y - A.y);
                        newLine.B.x += (B.x - A.x);
                        newLine.B.y += (B.y - A.y);
                        lines[movingObjectIndex] = newLine;
                        A = new Point(B.x, B.y);
                    } else if (activeFigure === "rectangle") {
                        const newRectangle = rectangles[movingObjectIndex];
                        newRectangle.A.x += (B.x - A.x);
                        newRectangle.A.y += (B.y - A.y);
                        newRectangle.B.x += (B.x - A.x);
                        newRectangle.B.y += (B.y - A.y);
                        rectangles[movingObjectIndex] = newRectangle;
                        A = new Point(B.x, B.y);
                    } else if (activeFigure === "circle") {
                        const newCircle = circles[movingObjectIndex];
                        newCircle.O.x += (B.x - A.x);
                        newCircle.O.y += (B.y - A.y);
                        circles[movingObjectIndex] = newCircle;
                        A = new Point(B.x, B.y);
                    }
                    refreshCanvas();
                }
            } else if (activeTool === "resizing") {
                if (resizingObjectIndex !== -1) {
                    if (activeFigure === "line") {
                        if (resizingLinePoint === "A") {
                            lines[resizingObjectIndex].A = B;
                        } else if (resizingLinePoint === "B") {
                            lines[resizingObjectIndex].B = B;
                        }
                    } else if (activeFigure === "rectangle") {
                        rectangles[resizingObjectIndex].A.x = A.x;
                        rectangles[resizingObjectIndex].A.y = A.y;
                        rectangles[resizingObjectIndex].B = B;
                    } else if (activeFigure === "circle") {
                        const circle = circles[resizingObjectIndex];
                        const R = Math.sqrt(Math.pow(B.x - circle.O.x, 2) + Math.pow(B.y - circle.O.y, 2));
                        circle.radius = R;
                    }
                    refreshCanvas();
                }
            }
        }
    });

    $("button.line").click(() => {
        const [
            fromX
        ] = $("#line-from-x");
        const [
            fromY
        ] = $("#line-from-y");
        const [
            toX
        ] = $("#line-to-x");
        const [
            toY
        ] = $("#line-to-y");
        const {
            value: fromXValue
        } = fromX;
        const {
            value: fromYValue
        } = fromY;
        const {
            value: toXValue
        } = toX;
        const {
            value: toYValue
        } = toY;
        if (fromXValue > 0 && fromXValue < width && fromYValue > 0 && fromYValue < height && toXValue > 0 && toXValue < width && toYValue > 0 && toYValue < height) {
            A = new Point(parseInt(fromXValue), parseInt(fromYValue));
            B = new Point(parseInt(toXValue), parseInt(toYValue));
            if (activeTool !== "changing") {
                const line = new Line(A, B);
                lines.push(line);
                drawLine(line);
            } else if (activeFigure === "line") {
                lines[changingObjectIndex] = new Line(A, B);
                console.log(A, B);
                refreshCanvas();
                refreshForms();
            }
        }
    });

    $("button.rectangle").click(() => {
        const [
            fromX
        ] = $("#rectangle-x");
        const [
            fromY
        ] = $("#rectangle-y");
        const [
            rectW
        ] = $("#rectangle-width");
        const [
            rectH
        ] = $("#rectangle-height");
        const {
            value: x
        } = fromX;
        const {
            value: y
        } = fromY;
        const {
            value: rectWidth
        } = rectW;
        const {
            value: rectHeight
        } = rectH;
        if (x > 0 && x < width && y > 0 && y < height && parseInt(x) + parseInt(rectWidth) < height && parseInt(y) + parseInt(rectHeight) < height) {
            A = new Point(x, y);
            B = new Point(parseInt(x) + parseInt(rectWidth), parseInt(y) + parseInt(rectHeight));
            if (activeTool !== "changing") {
                context.moveTo(A.x, A.y);
                context.lineTo(B.x, A.y);
                context.stroke();
                context.moveTo(B.x, A.y);
                context.lineTo(B.x, B.y);
                context.stroke();
                context.moveTo(B.x, B.y);
                context.lineTo(A.x, B.y);
                context.stroke();
                context.moveTo(A.x, B.y);
                context.lineTo(A.x, A.y);
                context.stroke();
                rectangles.push(new Rectangle(new Point(Math.min(A.x, B.x), Math.min(A.y, B.y)), new Point(Math.max(A.x, B.x), Math.max(A.y, B.y))));
            } else if (activeFigure === "rectangle") {
                rectangles[changingObjectIndex] = new Rectangle(new Point(Math.min(A.x, B.x), Math.min(A.y, B.y)), new Point(Math.max(A.x, B.x), Math.max(A.y, B.y)));
                refreshCanvas();
                refreshForms();
                changingObjectIndex = -1;
            }
        }
    });

    $("button.circle").click(() => {
        const [
            circleX
        ] = $("#circle-x");
        const [
            circleY
        ] = $("#circle-y");
        const [
            circleRadius
        ] = $("#circle-radius");
        const {
            value: x
        } = circleX;
        const {
            value: y
        } = circleY;
        const {
            value: radius
        } = circleRadius;
        const O = new Point(parseInt(x), parseInt(y));
        const circle = new Circle(O, parseInt(radius));
        if (activeTool !== "changing") {
            circles.push(circle);
            drawCircle(circle);
        } else if (activeFigure === "circle") {
            circles[changingObjectIndex] = circle;
            refreshCanvas();
            refreshForms();
            changingObjectIndex = -1;
        }
    });

    $("button.clear").click(clearCanvas);

});

const drawLine = line => {
    context.beginPath();
    context.moveTo(line.A.x, line.A.y);
    context.lineTo(line.B.x, line.B.y);
    context.stroke();
};

const drawRectangle = rectangle => {
    const {
        A,
        B
    } = rectangle;
    context.beginPath();
    context.moveTo(A.x, A.y);
    context.lineTo(B.x, A.y);
    context.stroke();
    context.moveTo(B.x, A.y);
    context.lineTo(B.x, B.y);
    context.stroke();
    context.moveTo(B.x, B.y);
    context.lineTo(A.x, B.y);
    context.stroke();
    context.moveTo(A.x, B.y);
    context.lineTo(A.x, A.y);
    context.stroke();
};

const drawCircle = circle => {
    const {
        O,
        radius
    } = circle;
    context.beginPath();
    context.arc(O.x, O.y, radius, 0, 2 * Math.PI, false);
    context.stroke();
};

const changeActiveTool = tool => {
    if (activeTool !== tool) {
        activeTool = tool;
        $("span.tool").removeClass("active").addClass("inactive");
        $(`span.${tool}`).removeClass("inactive").addClass("active");
    }
};

const changeActiveFigure = figure => {
    if (activeFigure !== figure) {
        activeFigure = figure;
        $("span.figure").removeClass("active").addClass("inactive");
        $(`span.${figure}`).removeClass("inactive").addClass("active");
    }
};

const updateChangingObject = () => {
    if (activeTool === "changing" && changingObjectIndex !== -1) {
        switch (activeFigure) {
            case "line":
                const line = lines[changingObjectIndex];
                $("#line-from-x").val(line.A.x);
                $("#line-from-y").val(line.A.y);
                $("#line-to-x").val(line.B.x);
                $("#line-to-y").val(line.B.y);
                break;
            case "rectangle":
                const rectangle = rectangles[changingObjectIndex];
                $("#rectangle-x").val(rectangle.A.x);
                $("#rectangle-y").val(rectangle.A.y);
                $("#rectangle-width").val(Math.abs(rectangle.A.x - rectangle.B.x));
                $("#rectangle-height").val(Math.abs(rectangle.A.y - rectangle.B.y));
                break;
            case "circle":
                const circle = circles[changingObjectIndex];
                $("#circle-x").val(circle.O.x);
                $("#circle-y").val(circle.O.y);
                $("#circle-radius").val(circle.radius);
                break;
            default:
                break;
        }
    }
};

const clearCanvas = () => {
    context.clearRect(0, 0, width, height);
    lines = [];
    rectangles = [];
    circles = [];
};

const refreshCanvas = () => {
    context.clearRect(0, 0, width, height);
    for (let line of lines) {
        drawLine(line);
    }
    for (let rectangle of rectangles) {
        drawRectangle(rectangle);
    }
    for (let circle of circles) {
        drawCircle(circle);
    }
};

const refreshForms = () => {
    $("#line-from-x").val(0);
    $("#line-from-y").val(0);
    $("#line-to-x").val(0);
    $("#line-to-y").val(0);
    $("#rectangle-x").val(0);
    $("#rectangle-y").val(0);
    $("#rectangle-width").val(0);
    $("#rectangle-height").val(0);
    $("#circle-x").val(0);
    $("#circle-y").val(0);
    $("#circle-radius").val(0);
};

$("body").mouseup(() => {
    setTimeout(() => {
        mouseDown = false;
    }, 50);
});

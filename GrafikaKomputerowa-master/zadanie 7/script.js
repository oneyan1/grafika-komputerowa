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
    constructor(O, R) {
        this.O = O;
        this.R = R;
    }
}


$(() => {

    const canvas = $("#canvas")[0];
    const context = canvas.getContext("2d");

    context.strokeStyle = "#ffffff";

    const width = canvas.width;
    const height = canvas.height;

    let activeTool = "drawing-line";

    $(".tool").click(function() {
        if (activeTool === $(this).attr("id")) return;
        activeTool = $(this).attr("id");
        $(".tool").removeClass("active").addClass("inactive");
        $(this).removeClass("inactive").addClass("active");
    });

    $("#draw-line").click(() => {
        const A = new Point($("#line-x1").val(), $("#line-y1").val());
        const B = new Point($("#line-x2").val(), $("#line-y2").val());
        const line = new Line(A, B);
        drawLine(line);
    });

    $("#draw-rectangle").click(() => {
        const A = new Point($("#rectangle-x1").val(), $("#rectangle-y1").val());
        const B = new Point($("#rectangle-x2").val(), $("#rectangle-y2").val());
        const rectangle = new Rectangle(A, B);
        drawRectangle(rectangle);
    });

    $("#draw-circle").click(() => {
        const O = new Point($("#circle-ox").val(), $("#circle-oy").val());
        const R = $("#circle-r").val();
        const circle = new Circle(O, R);
        drawCircle(circle);
    });

    $("#reset").click(() => {
        context.clearRect(0, 0, width, height);
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
            R
        } = circle;
        context.beginPath();
        context.arc(O.x, O.y, R, 0, 2 * Math.PI, false);
        context.stroke();
    };

});

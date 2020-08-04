let min = 99;
let max = 999999;
let polygonMode = true;
let pointArray = [];
let lineArray = [];
let activeLine;
let activeShape;
let canvas;

$(window).on('load', function () {
    prototypeFabric.initCanvas();
    $('#create-polygon').on('click', function () {
        prototypeFabric.polygon.drawPolygon();
    });
});

let prototypeFabric = new function () {
    this.initCanvas = function () {
        canvas = window._canvas = new fabric.Canvas('c');
        canvas.setWidth($(window).width());
        canvas.setHeight($(window).height() - $('#nav-bar').height());
        //canvas.selection = false;

        canvas.on('mouse:down', function (options) {
            const {addPoint, generatePolygon} = prototypeFabric.polygon;
            if (options.target && options.target.id === pointArray[0].id) {
                generatePolygon(pointArray);
            }
            if (polygonMode) {
                addPoint(options);
            }
        });

        canvas.on('mouse:move', function (options) {
            if (activeLine && activeLine.class === "line") {
                let pointer = canvas.getPointer(options.e);
                activeLine.set({ x2: pointer.x, y2: pointer.y });

                let points = activeShape.get("points");
                points[pointArray.length] = {
                    x: pointer.x,
                    y: pointer.y
                }
                activeShape.set({
                    points: points
                });
                canvas.renderAll();
            }
            canvas.renderAll();
        });
    };
};

/**
 * POLYGON handler
 * @param button
 * @param viewer
 * @constructor
 */
function Polygon(button, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    const canvas = overlay.fabricCanvas();
    let idx;

    function isRealValue(obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }

    idx = button.id.trim(-1).replace("btnPolygon", ""); // something else
    let roof = null;
    let roofPoints = [];
    let lines = [];
    let lineCounter = 0;

    let drawingObject = {
        type: '',
        background: '',
        border: ''
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    button.addEventListener('click', function () {

        if (drawingObject.type === "roof") {

            drawingObject.type = "";
            lines.forEach(function (value) {
                canvas.remove(value);
            });

            //canvas.remove(lines[lineCounter - 1]);
            roof = makeRoof(roofPoints);
            canvas.add(roof);
            canvas.renderAll();

        } else {
            drawingObject.type = "roof"; // roof type
        }
    });

    // Canvas Drawing
    let x = 0;
    let y = 0;

    // Double-click = finish.
    fabric.util.addListener(window, 'dblclick', function () {

        drawingObject.type = "";
        lines.forEach(function (value) {
            canvas.remove(value);
        });

        //canvas.remove(lines[lineCounter - 1]);
        roof = makeRoof(roofPoints);
        canvas.add(roof);
        canvas.renderAll();

        //clear arrays
        roofPoints = [];
        lines = [];
        lineCounter = 0;

        viewer.gestureSettingsMouse.clickToZoom = true;

    });

    // Add points
    canvas.on('mouse:down', function (options) {
        viewer.gestureSettingsMouse.clickToZoom = false;

        if (drawingObject.type === "roof") {

            canvas.selection = false;
            setStartingPoint(options); // set x,y
            roofPoints.push(new Point(x, y));
            let points = [x, y, x, y];

            lines.push(new fabric.Line(points, {
                strokeWidth: 3,
                selectable: false,
                stroke: 'red'
            }));
            // }).setOriginX(x).setOriginY(y));

            canvas.add(lines[lineCounter]);

            lineCounter++;

            canvas.on('mouse:up', function () {
                canvas.selection = true;
            });
        } else {
            viewer.gestureSettingsMouse.clickToZoom = true;
            // Disable fabric selection; otherwise, you get the weird purple box.
            overlay._fabricCanvas.selection = false;
        }
    });

    canvas.on('mouse:move', function (options) {

        if (isRealValue(lines[0]) && drawingObject.type === "roof") {

            setStartingPoint(options);
            lines[lineCounter - 1].set({
                "x2": x,
                "y2": y
            });
            canvas.renderAll();
        }
    });

    canvas.on("after:render", function () { canvas.calcOffset(); });
    function setStartingPoint(options) {
        // TODO: This is wrong?
        x = options.e.pageX - canvas._offset.left;
        y = options.e.pageY - canvas._offset.top;
    }

    function makeRoof(roofPoints) {

        let left = findPaddingForRoof(roofPoints, 'x');
        let top = findPaddingForRoof(roofPoints, 'y');

        roofPoints.push(new Point(roofPoints[0].x, roofPoints[0].y))

        let roof = new fabric.Polyline(roofPoints, {
            fill: 'rgba(0,0,0,0)',
            stroke: '#58c'
        });

        roof.set({
            left: left,
            top: top,
        });

        return roof;
    }

    function findPaddingForRoof(roofPoints, coord) {
        let result = 999999;

        for (let i = 0; i < lineCounter; i++) {
            if (roofPoints[i][coord] < result) {
                result = roofPoints[i][coord];
            }
        }

        return Math.abs(result);
    }

}

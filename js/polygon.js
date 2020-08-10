/**
 * POLYGON handler
 * mouse:down
 * mouse:up
 * mouse:move
 */
function Polygon(button, viewer) {

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

    function isRealValue(obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }

    let obj = fb.create(viewer);
    const overlay = obj.o;
    const canvas = obj.c;

    button.addEventListener('click', function (e) {
        console.log('e', e);
        if (drawingObject.type === "roof") {
            drawingObject.type = "";
            lines.forEach(function (value) {
                canvas.remove(value);
            });
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
    canvas.on('mouse:dblclick', finishPolygon);

    function finishPolygon() {
        drawingObject.type = "";
        lines.forEach(function (value) {
            canvas.remove(value);
        });
        roof = makeRoof(roofPoints);
        canvas.add(roof);
        canvas.renderAll();
        //clear arrays
        roofPoints = [];
        lines = [];
        lineCounter = 0;
        viewer.gestureSettingsMouse.clickToZoom = true;
    }

    function canvasSelect() {
        canvas.selection = true;
    }

    // Add points
    function addPoints(options) {

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
            canvas.on('mouse:up', canvasSelect);
        } else {
            viewer.gestureSettingsMouse.clickToZoom = true;
            // Disable fabric selection; otherwise, you get the weird purple box.
            overlay._fabricCanvas.selection = false;
        }
    }
    canvas.on('mouse:down', addPoints);

    function calculateLines(options) {
        if (isRealValue(lines[0]) && drawingObject.type === "roof") {
            setStartingPoint(options);
            lines[lineCounter - 1].set({
                "x2": x,
                "y2": y
            });
            canvas.renderAll();
        }
    }
    canvas.on('mouse:move', calculateLines);

    canvas.on("after:render", function () { canvas.calcOffset(); });

    function setStartingPoint(options) {
        // clientX, offsetX, pageX
        // let offset = $('#canvas-tools').offset();
        // x = options.e.pageX - offset.left;
        // y = options.e.pageY - offset.top;
        x = options.e.pageX - canvas._offset.left;
        y = options.e.pageY - canvas._offset.top;
    }

    function makeRoof(roofPoints) {
        let left = findPaddingForRoof(roofPoints, 'x');
        let top = findPaddingForRoof(roofPoints, 'y');
        if (left === 999999 || top === 999999) {
            return;
        } else {
            roofPoints.push(new Point(roofPoints[0].x, roofPoints[0].y))
            roof = new fabric.Polyline(roofPoints, {
                strokeWidth: 3,
                fill: 'rgba(0,0,0,0)',
                stroke: 'green'
                // stroke: '#58c'
            });
            roof.set({
                left: left,
                top: top,
            });
        }
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

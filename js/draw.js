/**
 * FreeDrawing handler
 * @param button
 * @param viewer
 * @constructor
 */
function FreeDrawing(button, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    const canvas = overlay.fabricCanvas();
    let idx;

    if (button.id.includes("btnDraw"))
        freeDrawing();
    else
        drawPolygon();

    function isRealValue(obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }

    function freeDrawing() {
        idx = button.id.trim(-1).replace("btnDraw", "");
        const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
        const mark = document.getElementById('mark' + idx);
        paintBrush.color = mark.innerHTML;

        function customizeControls(obj) {
            // For the object that was drawn
            obj['hasControls'] = false;
            obj.lockMovementX = true; // hold in place
            obj.lockMovementY = true;

            function addDeleteBtn(x, y, el) {
                // console.log(x, y, el);
                $(".deleteBtn").remove();
                let btnLeft = x - 10;
                let btnTop = y - 10;
                let deleteBtn = document.createElement('img');
                deleteBtn.src = "./img/delete-icon.png";
                deleteBtn.classList.add('deleteBtn')
                deleteBtn.style = `position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;`;
                deleteBtn.alt = "Delete Me";
                el.appendChild(deleteBtn);
            }

            // object:selected this event is deprecated as of 4.0.0
            canvas.on('selection:created', function (e) {
                let el = this.lowerCanvasEl.parentElement;
                addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
            })

            canvas.on('mouse:down', function (e) {
                // For example, panning or zooming after selection
                if (!canvas.getActiveObject()) {
                    $(".deleteBtn").remove();
                    viewer.gestureSettingsMouse.clickToZoom = true;
                } else {
                    // Make sure the viewer doesn't zoom when we click the delete button.
                    viewer.gestureSettingsMouse.clickToZoom = false;
                }
            });

            // Handle all the things
            canvas.on('object:modified', function (e) {
                let el = this.lowerCanvasEl.parentElement;
                addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
            });

            canvas.on('object:scaling', function (e) {
                $(".deleteBtn").remove();
            });

            canvas.on('object:moving', function (e) {
                $(".deleteBtn").remove();
            });

            canvas.on('object:rotating', function (e) {
                $(".deleteBtn").remove();
            });

            $(".canvas-container").on('click', ".deleteBtn", function () {
                // this = deleteBtn
                if (canvas.getActiveObject()) {
                    canvas.remove(canvas.getActiveObject());
                    $(".deleteBtn").remove();
                }
                // Delete finished; re-enable zoom.
                viewer.gestureSettingsMouse.clickToZoom = true;
            });

        }

        function saveCoordinates(d) {
            // TBA
        }

        function setBrushWidth(viewer) {
            let vzoom = viewer.viewport.getZoom(true);
            paintBrush.width = 20 / vzoom;
        }

        function clearClassList(element) {
            let classList = element.classList;
            while (classList.length > 0) {
                classList.remove(classList.item(0));
            }
        }

        // param: viewer, button, canvas
        function toggleDraw(v, btn, c) {
            let mouseTracker = v.outerTracker;
            if (btn.classList.contains('btnOn')) {
                // End Draw
                v.setMouseNavEnabled(true);
                mouseTracker.setTracking(true);
                clearClassList(btn);
                btn.classList.add('btn');
                c.isDrawingMode = false;
            } else {
                // Start Draw
                v.setMouseNavEnabled(false);
                mouseTracker.setTracking(false);
                c.isDrawingMode = true;
                clearClassList(btn);
                btn.classList.add('btnOn');
            }
        }

        // EVENT LISTENERS

        // START DRAW
        button.addEventListener('click', function () {
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            toggleDraw(viewer, button, canvas);

        });

        // END DRAW
        canvas.on("path:created", function (e) {
            toggleDraw(viewer, button, canvas);
            let d = e.path;
            customizeControls(d);
            saveCoordinates(d);
            // console.log('PATH:\n', e.path.path);

        });
    }

    /**
     * POLYGON
     */
    function drawPolygon() {
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

}

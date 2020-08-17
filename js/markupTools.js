function markupTools(idx, viewer) {

    // const obj = fb.create(viewer);
    // const overlay = obj.o;
    // const canvas = obj.c;
    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });
    const canvas = overlay.fabricCanvas();

    const btnGrid = document.getElementById('btnGrid' + idx);
    const btnPolygon = document.getElementById('btnPolygon' + idx);
    const btnDraw = document.getElementById('btnDraw' + idx);

    function clearClassList(element) {
        let classList = element.classList;
        while (classList.length > 0) {
            classList.remove(classList.item(0));
        }
    }

    function toggleButton(btn) {
        let isOn = btn.classList.contains('btnOn');
        clearClassList(btn);
        if (isOn) {
            btn.classList.add('btn');
        } else {
            btn.classList.add('btnOn');
        }
    }

    /**
     * GRID handler
     */
    let cellX = [], cellY = [];
    const sizeOfBox = 50;
    const width = canvas.width;
    const numBoxes = (width / sizeOfBox);
    for (let imoX = 0; imoX < numBoxes; imoX++) {
        cellX[imoX + 1] = imoX * sizeOfBox;
    }
    for (let imoY = 0; imoY < numBoxes; imoY++) {
        cellY[imoY + 1] = imoY * sizeOfBox;
    }
    let gridAdded = false;

    function makeLine(coords) {
        return new fabric.Line(coords, {
            stroke: "#ccc",
            strokeWidth: 2,
            selectable: false
        });
    }

    // Mouse move event-handler
    function mouseCoords(e) {
        // let c = viewer.drawer.canvas;
        let pointer = e.absolutePointer;
        // let pointer = e.pointer;
        let ctx = viewer.drawer.context;
        // let cx = e.clientX; // get horizontal coordinate of mouse pointer
        // let cy = e.clientY; // vertical coordinate
        let cx = pointer.x;
        let cy = pointer.y;

        let x = cx / sizeOfBox;
        let y = cy / sizeOfBox;

        let imoX = Math.ceil(x + 0.001); // IsMouseOverX (mouse(block) position on grid)
        let imoY = Math.ceil(y + 0.001); // IsMouseOverY (mouse(block) position on grid)

        ctx.fillStyle = "red";
        ctx.fillRect(cellX[imoX], cellY[imoY], sizeOfBox, sizeOfBox);

    }

    btnGrid.addEventListener('click', function () {

        if (btnGrid.classList.contains('btnOn')) {
            // remove only the lines
            let r = canvas.getObjects('line');
            for (let i = 0; i < r.length; i++) {
                canvas.remove(r[i]);
            }
            btnGrid.innerHTML = 'Draw grid';
            gridAdded = false;

        } else {
            for (let i = 0; i < numBoxes; i++) {
                canvas.add(makeLine([i * sizeOfBox, 0, i * sizeOfBox, width]));
                canvas.add(makeLine([0, i * sizeOfBox, width, i * sizeOfBox]));
            }
            btnGrid.innerHTML = 'Remove grid';
            gridAdded = true;
        }
        toggleButton(btnGrid);

    });

    // function onObjectSelected(e) {
    //     console.log(e.target.get('type'));
    // }
    // canvas.on('selection:created', onObjectSelected);

    let btnMarker = document.getElementById('btnMarker' + idx);
    btnMarker.addEventListener('click', markerHandler);

    function markerHandler() {
        let toggle = true;
        if (btnMarker.classList.contains('btnOn')) {
            canvas.off("mouse:move", mouseCoords);
            btnMarker.innerHTML = "Mark grid";

        } else {
            if (!gridAdded) {
                toggle = false;
                alert("Add a grid first!");
            } else {
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "Done marking";
            }
        }
        if (toggle) {
            toggleButton(btnMarker);
        }
    }

    /**
     * POLYGON handler
     */
    let roof = new fabric.Polyline(); // It's a POLYLINE.
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

    // POLYGON BUTTON
    btnPolygon.addEventListener('click', function () {

        if (!canvas.isDrawingMode) {
            toggleButton(btnPolygon);
            if (drawingObject.type === "roof") {
                // drawing off
                drawingObject.type = "";
                canvas.off('mouse:down', addPoints);
                clear();
                // click-to-zoom on
                viewer.gestureSettingsMouse.clickToZoom = true;
            } else {
                // drawing on
                drawingObject.type = "roof";
                canvas.on('mouse:down', addPoints);
                // click-to-zoom off
                viewer.gestureSettingsMouse.clickToZoom = false;
            }
        }

    });

    function clear() {
        drawingObject.type = "";
        lines.forEach(function (value) {
            canvas.remove(value);
        });

        // clear arrays
        roofPoints = [];
        lines = [];
        lineCounter = 0;

    }

    // Canvas Drawing
    let x = 0;
    let y = 0;

    // Double-click = finish.
    canvas.on('mouse:dblclick', finishPolygon);

    function finishPolygon() {

        if (lines.length > 0) {
            // length > 0; because "double-click happens"
            roof = makeRoof(roofPoints);

            if (Array.isArray(roof.points) && roof.points.length) {
                // makeRoof successful
                canvas.add(roof);
                canvas.renderAll();
            }

            // button reset
            toggleButton(btnPolygon);
            clear();
        }

    }

    function canvasSelect() {
        canvas.selection = true;
    }

    // Add points
    function addPoints(options) {

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

            // Disable fabric selection; otherwise, you get the weird purple box.
            overlay._fabricCanvas.selection = false;
        }
    }

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

    canvas.on("after:render", function () {
        canvas.calcOffset();
    });

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

        if (left !== 999999 && top !== 999999) {
            roofPoints.push(new Point(roofPoints[0].x, roofPoints[0].y));
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

    document.getElementById('btnEdit' + idx).addEventListener('click', function () {
        Edit(canvas);
    });

    /**
     * FreeDrawing handler
     */
    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    const mark = document.getElementById('mark' + idx);
    paintBrush.color = mark.innerHTML;

    function addDeleteBtn(x, y, el) {
        $(".deleteBtn").remove();
        let btnLeft = x - 10;
        let btnTop = y - 10;
        let deleteBtn = document.createElement('img');
        deleteBtn.src = "./img/delete-icon.png";
        deleteBtn.classList.add('deleteBtn')
        deleteBtn.style = `position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;`;
        deleteBtn.alt = "delete object";
        el.appendChild(deleteBtn);
    }

    function customizeControls(obj) {
        // For the object that was drawn
        obj['hasControls'] = false;
        obj.lockMovementX = true; // hold in place
        obj.lockMovementY = true;

        canvas.on('selection:created', function (e) {
            // viewer.gestureSettingsMouse.clickToZoom = false;
            let el = this.lowerCanvasEl.parentElement;
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        })

        // Handle all the things
        canvas.on('object:modified', function (e) {
            let el = this.lowerCanvasEl.parentElement;
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        });

        canvas.on('object:scaling', function () {
            $(".deleteBtn").remove();
        });

        canvas.on('object:moving', function () {
            $(".deleteBtn").remove();
        });

        canvas.on('object:rotating', function () {
            $(".deleteBtn").remove();
        });

        $(".canvas-container").on('click', ".deleteBtn", function () {
            viewer.gestureSettingsMouse.clickToZoom = false;
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
        paintBrush.width = 10 / viewer.viewport.getZoom(true);
    }

    // DRAW BUTTON
    btnDraw.addEventListener('click', function () {
        toggleButton(btnDraw);
        function pathCreatedHandler(e) {
            canvas.off('mouse:down', mousedownHandler);
            let d = e.path;
            customizeControls(d);
            clearClassList(btnDraw);
            btnDraw.classList.add('btn');
            // saveCoordinates(d); // TODO: Add button for save
            // console.log('PATH:\n', e.path.path);
        }

        function mouseupHandler() {
            // Drawing off
            viewer.setMouseNavEnabled(true);
            viewer.outerTracker.setTracking(true);
            canvas.isDrawingMode = false;
        }
        canvas.on("mouse:up", mouseupHandler);
        canvas.on("path:created", pathCreatedHandler);

        function mousedownHandler() {
            // For example, panning or zooming after selection
            if (!canvas.getActiveObject()) {
                $(".deleteBtn").remove();
                viewer.gestureSettingsMouse.clickToZoom = true;
            } else {
                // Make sure the viewer doesn't zoom when we click the delete button.
                viewer.gestureSettingsMouse.clickToZoom = false;
            }
        }

        let mouseTracker = viewer.outerTracker;
        if (canvas.isDrawingMode) {
            // drawing off
            canvas.off('mouse:down', mousedownHandler);
            viewer.setMouseNavEnabled(true);
            mouseTracker.setTracking(true);
            canvas.isDrawingMode = false;
        }
        else {
            // drawing on
            canvas.on('mouse:down', mousedownHandler);
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            viewer.setMouseNavEnabled(false);
            mouseTracker.setTracking(false);
            canvas.isDrawingMode = true;
        }
    });
}

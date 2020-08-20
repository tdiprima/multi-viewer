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
                alert("Draw a GRID first!");
            } else {
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "Done marking";
            }
        }
        if (toggle) {
            toggleButton(btnMarker);
        }
    }

    // EDIT POLYGON
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

    function f(e, c) {
        let el = c.lowerCanvasEl.parentElement;
        addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
    }

    function customizeControls(obj) {
        // For the object that was drawn
        obj['hasControls'] = false;
        obj.lockMovementX = true; // hold in place
        obj.lockMovementY = true;

        canvas.on('selection:created', function (e) {
            f(e, canvas);
        })

        // It's not movable/scalable/etc now, but it might be one day.
        canvas.on('object:modified', function (e) {
            f(e, canvas);
        });

        canvas.on('object:scaling', function (e) {
            $(".deleteBtn").remove();
            f(e, canvas);
        });

        canvas.on('object:moving', function (e) {
            $(".deleteBtn").remove();
            f(e, canvas);
        });

        canvas.on('object:rotating', function (e) {
            $(".deleteBtn").remove();
            f(e, canvas);
        });

        // TODO: select
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

    function souris(what) {
        viewer.setMouseNavEnabled(what);
        viewer.outerTracker.setTracking(what);
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
            souris(true);
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
                // Prevent zoom on delete.
                viewer.gestureSettingsMouse.clickToZoom = false;
            }
        }

        let mouseTracker = viewer.outerTracker;
        if (canvas.isDrawingMode) {
            // drawing off
            canvas.off('mouse:down', mousedownHandler);
            souris(true);
            canvas.isDrawingMode = false;
        } else {
            // drawing on
            canvas.on('mouse:down', mousedownHandler);
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            souris(false);
            canvas.isDrawingMode = true;
        }
    });
}

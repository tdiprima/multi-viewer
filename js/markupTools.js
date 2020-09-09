function markupTools(idx, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });
    const canvas = overlay.fabricCanvas();

    const btnGrid = document.getElementById('btnGrid' + idx);
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

    let cellX = [], cellY = [], cell_size = 50, gridAdded = false, dim_width, dim_height;

    function renderGrid(width, height, cell_width, cell_height, color) {
        console.log(width, height, cell_width, cell_height, color)

        let lineOption = { stroke: color, strokeWidth: 2, selectable: false }

        // Horizontal grid lines
        for (let y = 0; y < Math.ceil(height / cell_height); ++y) {
            canvas.add(new fabric.Line([0, y * cell_height, width, y * cell_height], lineOption));
            cellY[y + 1] = y * cell_height;
        }

        // Vertical grid lines
        for (let x = 0; x < Math.ceil(width / cell_width); ++x) {
            canvas.add(new fabric.Line([x * cell_width, 0, x * cell_width, height], lineOption));
            // cellX[x + 1] = x * cell_width;
            cellX[x] = x * cell_width;
        }
        canvas.renderAll();
        gridAdded = true;

    }

    // Grid button event handler
    btnGrid.addEventListener('click', function () {

        let dimWidthEl = document.getElementById("dim-w");
        let dimHeightEl = document.getElementById("dim-h");

        if (isRealValue(dimWidthEl) && isRealValue(dimHeightEl)) {
            dim_width = Math.ceil(dimWidthEl.value);
            dim_height = Math.ceil(dimHeightEl.value);

            if (btnGrid.classList.contains('btnOn')) {
                // Remove only the lines
                let r = canvas.getObjects('line');
                for (let i = 0; i < r.length; i++) {
                    canvas.remove(r[i]);
                }
                btnGrid.innerHTML = '<i class="fa fa-border-all"></i> Draw grid';
                gridAdded = false;

            } else {

                // DRAW GRID
                renderGrid(dim_width, dim_height, cell_size, cell_size, 'red');
                btnGrid.innerHTML = '<i class="fa fa-border-all"></i> Remove grid';
                gridAdded = true;
            }
        }
        toggleButton(btnGrid);

    });


    // Grid Marker
    let btnMarker = document.getElementById('btnMarker' + idx);
    btnMarker.addEventListener('click', markerHandler);

    // Get coordinates of mouse pointer
    function mouseCoords(options) {
        let event = options.e;
        let rect = document.getElementById('viewer' + idx).getBoundingClientRect();
        const mouseCoords = { x: event.clientX - rect.left, y: event.clientY - rect.top }

        let cx = mouseCoords.x;
        let cy = mouseCoords.y;

        let x = cx / cell_size;
        let y = cy / cell_size;
        let imoX = Math.ceil(x + 0.001); // IsMouseOverX (mouse(block) position on grid)
        let imoY = Math.ceil(y + 0.001); // IsMouseOverY (mouse(block) position on grid)

        let ctx = viewer.drawer.context;
        ctx.fillStyle = "red";
        ctx.fillRect(cellX[imoX], cellY[imoY], cell_size, cell_size);
    }

    // Grid marker event handler
    function markerHandler() {
        let toggle = true;
        if (btnMarker.classList.contains('btnOn')) {
            // Remove mouse:move listener (we also use it for other things)
            canvas.off("mouse:move", mouseCoords);
            btnMarker.innerHTML = "<i class=\"fa fa-paint-brush\"></i> Mark grid";

        } else {
            if (!gridAdded) {
                toggle = false;
                alert("Please draw a grid first.");
            } else {
                // Add listener
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "<i class=\"fa fa-paint-brush\"></i> Done marking";
            }
        }
        if (toggle) {
            toggleButton(btnMarker);
        }
    }

    // EDIT POLYGON
    document.getElementById('btnEdit' + idx).addEventListener('click', function () {
        toggleButton(this);
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
        deleteBtn.style = `position:absolute;top:${btnTop};left:${btnLeft};cursor:pointer;width:20px;height:20px;`;
        deleteBtn.alt = "delete object";
        el.appendChild(deleteBtn);
    }

    function f(e, c) {
        let el = c.lowerCanvasEl.parentElement;
        if (isRealValue(e.target.oCoords.tr) && isRealValue(el)) {
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        }
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

    function setBrushWidth(viewer) {
        paintBrush.width = 10 / viewer.viewport.getZoom(true);
    }

    function mToggle(what) {
        viewer.setMouseNavEnabled(what);
        viewer.outerTracker.setTracking(what);
    }

    // todo: fix. it makes 2 on 2nd make line.
    //function pathToPoly(fabPath) {

    // DRAW BUTTON
    btnDraw.addEventListener('click', function () {
        toggleButton(btnDraw);
        canvas.on("mouse:up", mouseupHandler);
        canvas.on("path:created", pathCreatedHandler);

        function pathCreatedHandler(options) {
            // options gives you the Path object
            // todo: get this to stop doing it for all objects.
            let fabPath = options.path;
            pathToPoly(fabPath, canvas, paintBrush);
            customizeControls(fabPath);
            clearClassList(btnDraw);
            btnDraw.classList.add('btn');
            // canvas.off('mouse:down', mousedownHandler);
            // canvas.off("mouse:up", mouseupHandler);
            // TODO: implement save
            // console.log('PATH:\n', path);
        }

        function mouseupHandler(options) {
            // options gives you the PointerEvent object
            // Drawing off
            canvas.isDrawingMode = false;
            mToggle(true);
        }

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

        if (canvas.isDrawingMode) {
            // drawing off
            canvas.isDrawingMode = false;
            canvas.off('mouse:down', mousedownHandler);
            mToggle(true);

        } else {
            // drawing on
            canvas.isDrawingMode = true;
            canvas.on('mouse:down', mousedownHandler);
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            mToggle(false);

        }
    });
}

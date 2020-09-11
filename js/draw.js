/**
 * FreeDrawing handler
 * mouse:down
 * mouse:up
 * path:created
 */
function freeDrawing(idx, viewer, overlay) {

    const canvas = overlay.fabricCanvas();

    const btnDraw = document.getElementById('btnDraw' + idx);
    const mark = document.getElementById('mark' + idx);
    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    paintBrush.color = mark.innerHTML;

    // EDIT POLYGON
    document.getElementById('btnEdit' + idx).addEventListener('click', function () {
        toggleButton(this);
        Edit(canvas);
    });

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

    function checkCoords(e, c) {
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
            checkCoords(e, canvas);
        })

        // It's not movable/scalable/etc now, but it might be one day.
        canvas.on('object:modified', function (e) {
            checkCoords(e, canvas);
        });

        canvas.on('object:scaling', function (e) {
            $(".deleteBtn").remove();
            checkCoords(e, canvas);
        });

        canvas.on('object:moving', function (e) {
            $(".deleteBtn").remove();
            checkCoords(e, canvas);
        });

        canvas.on('object:rotating', function (e) {
            $(".deleteBtn").remove();
            checkCoords(e, canvas);
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

    // DRAW BUTTON
    btnDraw.addEventListener('click', function () {
        toggleButton(btnDraw);
        canvas.on("mouse:up", mouseupHandler);
        canvas.on("path:created", pathCreatedHandler);

        // Because we need the object that we just created.
        function pathCreatedHandler(options) {
            // 'options' gives you the Path object
            let fabPath = options.path;
            pathToPoly(fabPath, canvas, paintBrush);

            customizeControls(fabPath);
            clearClassList(btnDraw);
            btnDraw.classList.add('btn');

            // canvas.off('mouse:down', mousedownHandler);
            // canvas.off("mouse:up", mouseupHandler);
            // console.log('PATH:\n', path);
        }

        function mouseupHandler(options) {
            // 'options' contains mouse pointer coordinates stuff

            // drawing off
            canvas.isDrawingMode = false;
            viewer.setMouseNavEnabled(true);
            viewer.outerTracker.setTracking(true);
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
            viewer.setMouseNavEnabled(true);
            viewer.outerTracker.setTracking(true);

        } else {
            // drawing on
            canvas.isDrawingMode = true;
            canvas.on('mouse:down', mousedownHandler);
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            viewer.setMouseNavEnabled(false);
            viewer.outerTracker.setTracking(false);

        }
    });
}

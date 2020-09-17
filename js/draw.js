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
    // const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    const paintBrush = canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
    paintBrush.decimate = 20;
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

    // DRAW BUTTON EVENT HANDLER
    btnDraw.addEventListener('click', function () {
        toggleButton(btnDraw);
        canvas.on("mouse:up", mouseupHandler);
        canvas.on("path:created", pathCreatedHandler);

        // Because we need the object that we just created.
        function pathCreatedHandler(options) {
            // console.log('pathCreatedHandler')

            // 'options' gives you the Path object
            let fabPath = options.path;
            pathToPoly(fabPath, canvas, paintBrush);

            customizeControls(fabPath);
            clearClassList(btnDraw);
            btnDraw.classList.add('btn');

            // canvas.off('mouse:down', mousedownHandler);
            // canvas.off("mouse:up", mouseupHandler);
            // console.log('PATH:\n', path);
            canvas.off("path:created", pathCreatedHandler);
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
            paintBrush.width = 10 / viewer.viewport.getZoom(true);
            viewer.setMouseNavEnabled(false);
            viewer.outerTracker.setTracking(false);

        }
    });

    // HOVER
    canvas.on('mouse:over', mouseOver);
    canvas.on('mouse:out', mouseOut);

    let textBox;
    function mouseOver(e) {
        try {
            let obj = e.target;
            let type = obj.type;
            if (isRealValue(obj) && type === 'polygon') { // no 'line', no 'rect' (grid).

                // TARGET FILL
                obj.set({
                    fill: obj.stroke,
                    opacity: 0.5
                });

                // TEXT
                let left = obj.left, top = obj.top;
                // JSON.stringify(canvas.toJSON())
                textBox = new fabric.Text(type, {
                    fontSize: 18,
                    fontFamily: 'Courier',
                    backgroundColor: 'rgba(102, 102, 102, 0.7)',
                    stroke: 'rgba(255, 255, 255, 1)',
                    fill: 'rgba(255, 255, 255, 1)',
                    left: left, //pointer.x,
                    top: top //pointer.y
                });
                canvas.add(textBox);
                canvas.renderAll();
            }
        } catch (e) {
            // console.log('eee', e.message);
        }
    }

    function mouseOut(e) {
        try {
            let obj = e.target;
            if (obj !== null) {

                // TARGET FILL
                obj.set({
                    fill: ''
                });

                // REMOVE TEXT
                canvas.remove(textBox);
                canvas.renderAll();
            }
        } catch (e) {
            // console.log('eee', e.message);
        }
    }
}

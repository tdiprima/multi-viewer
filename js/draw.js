/**
 * FreeDrawing handler
 * mouse:down
 * mouse:up
 * path:created
 */
function FreeDrawing(button, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    const canvas = overlay.fabricCanvas();
    const idx = button.id.trim(-1).replace("btnDraw", "");
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
            for (let prop in canvas.__eventListeners) {
                console.log(prop);
            }
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

        for (let prop in canvas.__eventListeners) {
            console.log(prop);
        }

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

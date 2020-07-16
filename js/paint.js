/**
 * Paint handler
 * @param button
 * @param viewer
 * @constructor
 */
function Paint(button, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    const canvas = overlay.fabricCanvas();
    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    const idx = button.id.trim(-1).replace("btnDraw", "");
    const mark = document.getElementById('mark' + idx);
    paintBrush.color = mark.innerHTML;

    function customizeControls(obj) {
        // For the object that was drawn
        obj['hasControls'] = false;
        obj.lockMovementX = true;
        obj.lockMovementY = true;

        function addDeleteBtn(x, y, el) {
            $(".deleteBtn").remove();
            let btnLeft = x - 10;
            let btnTop = y - 10;
            var deleteBtn = document.createElement('img');
            deleteBtn.src = "icons/delete-icon.png";
            deleteBtn.classList.add('deleteBtn')
            deleteBtn.style = `position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;`;
            deleteBtn.alt = "Delete Me";
            el.appendChild(deleteBtn);
        }

        canvas.on('object:selected', function (e) {
            let el = this.lowerCanvasEl.parentElement;
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        });

        canvas.on('mouse:down', function (e) {
            // For example, panning or zooming after selection
            if (!canvas.getActiveObject()) {
                $(".deleteBtn").remove();
            }
            else {
                // Make sure the viewer doesn't zoom when we click the delete button.
                viewer.gestureSettingsMouse.clickToZoom = false;
            }
        });

        $(".canvas-container").on('click', ".deleteBtn", function (event) {
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
        }
        else {
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

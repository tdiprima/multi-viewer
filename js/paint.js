// paint handler
function Paint(button, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    const canvas = overlay.fabricCanvas();
    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    const idx = button.id.trim(-1).replace("btnDraw", "");
    const mark = document.getElementById('mark' + idx);
    paintBrush.color = mark.innerHTML;

    function isRealValue(obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }

    function ctrls(lineDrawn) {
        lineDrawn['hasControls'] = false;
        lineDrawn['hasBorders'] = false;
        lineDrawn['evented'] = false;
        // let arr = canvas.getObjects();
        // lineDrawn is canvas.item(n)
    }

    function customizeControls(lineDrawn) {
        lineDrawn['hasControls'] = false;
        lineDrawn.lockMovementX = true;
        lineDrawn.lockMovementY = true;
        canvas.renderAll(); //

        function addDeleteBtn(x, y, el) {
            $(".deleteBtn").remove();
            let btnLeft = x - 10;
            let btnTop = y - 10;
            var deleteBtn = document.createElement('img');
            deleteBtn.src = "icons/delete-icon.png";
            deleteBtn.classList.add('deleteBtn')
            deleteBtn.style = `position:absolute; top:${btnTop}px; left:${btnLeft}px; cursor:pointer; width:20px; height:20px;`;
            deleteBtn.alt = "Delete Me";
            el.appendChild(deleteBtn);
        }

        canvas.on('object:selected', function (e) {
            let el = this.lowerCanvasEl.parentElement;
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        });

        $(".canvas-container").on('click', ".deleteBtn", function (event) {
            // this = deleteBtn
            if (canvas.getActiveObject()) {
                canvas.remove(canvas.getActiveObject());
                $(".deleteBtn").remove();
            }
        });
    }

    function saveCoordinates(lineDrawn) {
        // TBA
        // console.log("PATH:\n" + lineDrawn.path);
    }

    /**
     * Warning: [Viewport.viewportToImageZoom] is not accurate with multi-image.
     * But we only need an estimate here anyway.
     */
    function setBrushWidth(viewer) {
        let vzoom = viewer.viewport.getZoom(true);
        // let izoom = viewer.viewport.viewportToImageZoom(vzoom);
        paintBrush.width = 20 / vzoom;
        console.log('brush width:', paintBrush.width)
    }

    // EVENT LISTENERS

    // DRAWING START
    button.addEventListener('click', function () {
        paintBrush.color = mark.innerHTML;
        setBrushWidth(viewer)
        viewer.setMouseNavEnabled(false);
        viewer.outerTracker.setTracking(false);
        canvas.isDrawingMode = true;
        button.classList.remove('btn');
        button.classList.add('btnOn');
    });

    // DRAWING END
    canvas.on("path:created", function (e) {
        let lineDrawn = e.path;
        // console.log('PATH:\n', e.path.path);
        if (isRealValue(lineDrawn)) {
            // Get coordinates of human markup
            if (lineDrawn.type === "path") {
                // drawing has ended!
                viewer.setMouseNavEnabled(true);
                viewer.outerTracker.setTracking(true);
                button.classList.remove('btnOn');
                button.classList.add('btn');
                canvas.isDrawingMode = false;
                customizeControls(lineDrawn);
                saveCoordinates(lineDrawn);
            }
        }
    });
}

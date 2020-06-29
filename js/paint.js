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

    function between(x, min, max) {
        return x >= min && x <= max;
    }

    function customizeControls(lineDrawn) {
        lineDrawn['hasControls'] = false;
        lineDrawn['hasBorders'] = false;
        lineDrawn['evented'] = false;
        // let arr = canvas.getObjects();
        // lineDrawn is canvas.item(n)
    }

    function saveCoordinates(lineDrawn) {
        // TBA
        // console.log("PATH:\n" + lineDrawn.path);
    }

    function setBrushWidth(viewer) {
        let viewportZoom = viewer.viewport.getZoom();
        let x = viewer.viewport.viewportToImageZoom(viewportZoom);
        let b;

        if (between(x, 0.69, 1.1)) {
            b = 1;
        }
        if (between(x, 0, 0.35)) {
            b = 2;
        }
        if (between(x, 0, 0.18)) {
            b = 3;
        }
        if (between(x, 0, 0.086)) {
            b = 4;
        }
        if (between(x, 0, 0.043)) {
            b = 5;
        }
        if (between(x, 0, 0.022)) {
            b = 6;
        }

        // console.log('brush', b);
        paintBrush.width = b;

    }

    // EVENT LISTENERS

    // DRAWING START
    button.addEventListener('click', function () {
        paintBrush.color = mark.innerHTML;
        setBrushWidth(viewer)
        viewer.setMouseNavEnabled(false);
        viewer.outerTracker.setTracking(false);
        canvas.isDrawingMode = true;
        button.style.background = 'lightgreen';
    });

    // DRAWING END
    canvas.on('mouse:up', function (options) {
        let lineDrawn = options.target;
        // console.log("mouseup", lineDrawn);
        if (isRealValue(lineDrawn)) {
            // Get coordinates of human markup
            if (lineDrawn.type === "path") {
                // drawing has ended!
                viewer.setMouseNavEnabled(true);
                viewer.outerTracker.setTracking(true);
                button.style.background = 'lightgray';
                canvas.isDrawingMode = false;
                customizeControls(lineDrawn);
                saveCoordinates(lineDrawn);
            }
        }
    });
}

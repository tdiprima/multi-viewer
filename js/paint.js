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

    function ctrls(lineDrawn) {
        lineDrawn['hasControls'] = false;
        lineDrawn['hasBorders'] = false;
        lineDrawn['evented'] = false;

        // let arr = canvas.getObjects();
        // lineDrawn is canvas.item(n)
    }

    function customizeControls(lineDrawn) {

        lineDrawn['hasControls'] = false;
        canvas.renderAll(); //

        function addDeleteBtn(x, y) {
            $(".deleteBtn").remove();
            let btnLeft = x - 10;
            let btnTop = y - 10;
            let deleteBtn = '<img src="icons/delete-icon.png" class="deleteBtn" style="position:absolute;top:' + btnTop + 'px;left:' + btnLeft + 'px;cursor:pointer;width:20px;height:20px;" alt="Delete Me"/>';
            $(".canvas-container").append(deleteBtn);
        }

        canvas.on('object:selected', function (e) {
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y);
        });

        canvas.on('mouse:down', function (e) {
            if (!canvas.getActiveObject()) {
                $(".deleteBtn").remove();
            }
        });

        canvas.on('object:modified', function (e) {
            // on move completion
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y);
        });

        canvas.on('object:moving', function (e) {
            $(".deleteBtn").remove();
        });

        $(document).on('click', ".deleteBtn", function () {
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

    function setBrushWidth(viewer) {
        let viewportZoom = viewer.viewport.getZoom();
        // Warning: [Viewport.viewportToImageZoom] is not accurate with multi-image.
        // But we only need an estimate here anyway.
        let x = viewer.viewport.viewportToImageZoom(viewportZoom);
        let b = 0;

        if (x < 0.003) {
            b = 10;
        }

        if (between(x, 0.003, 0.005)) {
            b = 9;
        }
        if (between(x, 0.005    , 0.01)) {
            b = 7;
        }
        if (between(x, 0.01, 0.02)) {
            b = 3;
        }
        if (between(x, 0.02, 0.04)) {
            b = 2;
        }
        if (between(x, 0.04, 0.09)) {
            b = 1;
        }
        if (between(x, 0.09, 0.17)) {
            b = 0.5;
        }
        if (between(x, 0.17, 0.35)) {
            b = 0.25;
        }

        if (x > 0.35) {
            b = 0.1;
        }

        if (b === 0) {
            console.log('b === 0');
            b = 1;
        }

        paintBrush.width = b;
        console.log('zoom:', x);
        console.log('brush width:', b);

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

    // canvas.on('mouse:down', function (event) {
    //     console.log('event', event)
    // });

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
                button.style.background = 'lightgray';
                canvas.isDrawingMode = false;
                customizeControls(lineDrawn);
                saveCoordinates(lineDrawn);
            }
        }
    });
}

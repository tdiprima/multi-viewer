function Paint(elem, viewer) {
    // initialize overlay
    let options = {
        scale: 1000
    }
    let overlay = viewer.fabricjsOverlay(options);

    // DRAWING START
    elem.addEventListener('click', function () {
        overlay.fabricCanvas().freeDrawingBrush.color = 'red';
        overlay.fabricCanvas().freeDrawingBrush.width = 15;
        btnDraw(true);
    });

    // DRAWING END
    overlay.fabricCanvas().on('mouse:up', function (options) {
        let my_target = options.target;
        if (isRealValue(my_target)) {
            console.log("mouseup", my_target);
            // Get coordinates of human markup
            if (my_target.type === "path") {
                // drawing has ended!
                btnDraw(false);
                console.log("PATH:\n" + my_target.path);
            }
        }
    });

    btnDraw = function(flag) {
        if (flag) {
            viewer.setMouseNavEnabled(false);
            viewer.outerTracker.setTracking(false);
            overlay.fabricCanvas().isDrawingMode = true;
            elem.style.background='lightgreen';
        } else {
            viewer.setMouseNavEnabled(true);
            viewer.outerTracker.setTracking(true);
            elem.style.background='lightgray';
            overlay.fabricCanvas().isDrawingMode = false;
        }
    }

    isRealValue = function(obj)
    {
        return obj && obj !== 'null' && obj !== 'undefined';
    }
}
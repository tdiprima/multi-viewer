function Paint(idx, viewer) {
    // initialize overlay
    let options = {
        scale: 1000
    }
    let overlay = viewer.fabricjsOverlay(options);
    overlay.fabricCanvas().freeDrawingBrush.width = 3;

    let button = document.getElementById('btnDraw' + idx);
    let mark = document.getElementById('mark' + idx);
    overlay.fabricCanvas().freeDrawingBrush.color = mark.innerText;

    mark.addEventListener('change', function () {
        console.log("mark change", mark.id, mark.innerText);
        overlay.fabricCanvas().freeDrawingBrush.color = mark.innerText;
    })

    // DRAWING START
    button.addEventListener('click', function () {
        console.log("button click", button.id);
        btnDraw(true, viewer, overlay, mark, button);
    });

    // DRAWING END
    overlay.fabricCanvas().on('mouse:up', function (options) {
        console.log("mouseup");
        let my_target = options.target;
        if (isRealValue(my_target)) {
            // console.log("mouseup", my_target);
            // Get coordinates of human markup
            if (my_target.type === "path") {
                // drawing has ended!
                btnDraw(false, viewer, overlay, mark, button);
                console.log("PATH:\n" + my_target.path);
            }
        }
    });

    btnDraw = function (flag, viewer, overlay, mark, button) {
        if (flag) {
            viewer.setMouseNavEnabled(false);
            viewer.outerTracker.setTracking(false);
            overlay.fabricCanvas().isDrawingMode = true;
            overlay.fabricCanvas().freeDrawingBrush.color = mark.innerText;
            button.style.background = 'lightgreen';
        } else {
            viewer.setMouseNavEnabled(true);
            viewer.outerTracker.setTracking(true);
            button.style.background = 'lightgray';
            overlay.fabricCanvas().freeDrawingBrush.color = mark.innerText;
            overlay.fabricCanvas().isDrawingMode = false;
        }
    }

    isRealValue = function (obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }
}
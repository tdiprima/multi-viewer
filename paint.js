// paint handler
function Paint(button, viewer) {

    isRealValue = function (obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });
    const canvas = overlay.fabricCanvas();
    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;

    const idx = button.id.trim(-1).replace("btnDraw", "");
    const mark = document.getElementById('mark' + idx);
    paintBrush.color = mark.innerHTML;

    // button event listener
    // DRAWING START
    button.addEventListener('click', function () {
        paintBrush.color = mark.innerHTML;
        paintBrush.width = 3;
        viewer.setMouseNavEnabled(false);
        viewer.outerTracker.setTracking(false);
        canvas.isDrawingMode = true;
        button.style.background = 'lightgreen';
    });

    // DRAWING END
    canvas.on('mouse:up', function (options) {
        let my_target = options.target;
        // console.log("mouseup", my_target);
        if (isRealValue(my_target)) {
            // Get coordinates of human markup
            if (my_target.type === "path") {
                // drawing has ended!
                viewer.setMouseNavEnabled(true);
                viewer.outerTracker.setTracking(true);
                button.style.background = 'lightgray';
                canvas.isDrawingMode = false;
                canvas.item(0)['hasControls'] = false;
                canvas.item(0)['hasBorders'] = false;
                canvas.item(0)['evented'] = false;
                // console.log("PATH:\n" + my_target.path);
            }
        }

    })

}

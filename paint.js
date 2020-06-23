function Paint(elem, viewer) {
    let overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    elem.addEventListener('click', function () {
        overlay.fabricCanvas().freeDrawingBrush.color = 'red';
        overlay.fabricCanvas().freeDrawingBrush.width = 15;
        btnDraw(true);
    });

    // DRAWING END
    overlay.fabricCanvas().on('mouse:up', function (options) {
        let my_target = options.target;
        console.log("mouseup", my_target);
        // Get coordinates of human markup
        if (my_target.type === "path") {
            // drawing has ended!
            btnDraw(false);
            console.log("PATH:\n" + my_target.path);
        }
    })

    btnDraw = function(flag) {
        if (flag) {
            viewer.setMouseNavEnabled(false);
            viewer.outerTracker.setTracking(false);
            over.fabricCanvas().isDrawingMode = true;
            elem.style.background='lightgreen';
        } else {
            viewer.setMouseNavEnabled(true);
            viewer.outerTracker.setTracking(true);
            elem.style.background='lightgray';
            over.fabricCanvas().isDrawingMode = false;
        }
    }

    // DRAWING START
    // overlay.fabricCanvas().on('mouse:down', function (options) {
    //     let my_target = options.target;
    //     // we clicked the button
    //     if (my_target && (my_target.action === 'button')) {
    //         btnDraw(true);
    //     }
    // });
    
}
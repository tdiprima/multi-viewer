function markupTools(idx, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });
    const canvas = overlay.fabricCanvas();

    const btnGrid = document.getElementById('btnGrid' + idx);
    const btnDraw = document.getElementById('btnDraw' + idx);

    function clearClassList(element) {
        let classList = element.classList;
        while (classList.length > 0) {
            classList.remove(classList.item(0));
        }
    }

    function toggleButton(btn) {
        let isOn = btn.classList.contains('btnOn');
        clearClassList(btn);
        if (isOn) {
            btn.classList.add('btn');
        } else {
            btn.classList.add('btnOn');
        }
    }

    /**
     * GRID handler
     */
    const getOffset = (element, horizontal = false) => {
        if (!element) return 0;
        return getOffset(element.offsetParent, horizontal) + (horizontal ? element.offsetLeft : element.offsetTop);
    }

    function newDims() {
        let myElements = document.querySelectorAll("canvas");
        let retVal = [];
        let h = 0;
        for (let i = 0; i < myElements.length; i++) {
            let d = myElements[i];
            if (d.id) {
                h = d.height;
                console.log(d.id, d.width, d.height);
                break;
            }
        }
        console.log('canvas', canvas.width, canvas.height)
        let myElement = document.getElementById('viewer' + idx);
        retVal[0] = canvas.width; // let the width stay the same
        const offsetY = getOffset(myElement);
        retVal[1] = h + offsetY; // change height
        console.log('new', retVal[0], retVal[1]);

        return retVal;
    }

    let gridAdded = false;
    function line(x1, y1, x2, y2) {
        let line = new fabric.Line([x1, y1, x2, y2], {
            // stroke: 'white'
            // stroke: "#ccc",
            stroke: 'red',
            strokeWidth: 2,
            selectable: false
        });
        canvas.add(line);
    }

    function draw() {

        // let dd = newDims();
        // let width = dd[0], height = dd[1];
        //let whatever = $( '#viewers' );
        let whatever = $( '#viewers' );
        // console.log('whatever', whatever.width(), whatever.height())
        //let width = whatever.width(), height = whatever.height();
        let width = canvas.width, height = whatever.height();

        let x = 50;
        // Draw a line from x,0 to x,height.
        while (x < width) {
            line(x, 0, x, height);
            x += 50;
        }

        let y = 50;
        while (y < height) {
            // Draw a line from 0,y to width,y.
            line(0, y, width, y);
            y += 50;
        }
        gridAdded = true;
    }

    btnGrid.addEventListener('click', function () {

        if (btnGrid.classList.contains('btnOn')) {
            // remove only the lines
            let r = canvas.getObjects('line');
            for (let i = 0; i < r.length; i++) {
                canvas.remove(r[i]);
            }
            btnGrid.innerHTML = 'Draw grid';
            gridAdded = false;

        } else {
            draw();
            btnGrid.innerHTML = 'Remove grid';
            gridAdded = true;
        }
        toggleButton(btnGrid);

    });

    // function onObjectSelected(e) {
    //     console.log(e.target.get('type'));
    // }
    // canvas.on('selection:created', onObjectSelected);

    /*
    let btnMarker = document.getElementById('btnMarker' + idx);
    btnMarker.addEventListener('click', markerHandler);

    function markerHandler() {
        let toggle = true;
        if (btnMarker.classList.contains('btnOn')) {
            canvas.off("mouse:move", mouseCoords);
            btnMarker.innerHTML = "Mark grid";

        } else {
            if (!gridAdded) {
                toggle = false;
                alert("Draw a GRID first!");
            } else {
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "Done marking";
            }
        }
        if (toggle) {
            toggleButton(btnMarker);
        }
    }*/

    // EDIT POLYGON
    document.getElementById('btnEdit' + idx).addEventListener('click', function () {
        Edit(canvas);
    });

    /**
     * FreeDrawing handler
     */
    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    const mark = document.getElementById('mark' + idx);
    paintBrush.color = mark.innerHTML;

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

    function f(e, c) {
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
            f(e, canvas);
        })

        // It's not movable/scalable/etc now, but it might be one day.
        canvas.on('object:modified', function (e) {
            f(e, canvas);
        });

        canvas.on('object:scaling', function (e) {
            $(".deleteBtn").remove();
            f(e, canvas);
        });

        canvas.on('object:moving', function (e) {
            $(".deleteBtn").remove();
            f(e, canvas);
        });

        canvas.on('object:rotating', function (e) {
            $(".deleteBtn").remove();
            f(e, canvas);
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

    function setBrushWidth(viewer) {
        paintBrush.width = 10 / viewer.viewport.getZoom(true);
    }

    function mToggle(what) {
        viewer.setMouseNavEnabled(what);
        viewer.outerTracker.setTracking(what);
    }

    // todo: fix. it makes 2 on 2nd make line.
    //function pathToPoly(fabPath) {

    // DRAW BUTTON
    btnDraw.addEventListener('click', function () {
        toggleButton(btnDraw);
        canvas.on("mouse:up", mouseupHandler);
        canvas.on("path:created", pathCreatedHandler);

        function pathCreatedHandler(options) {
            // options gives you the Path object
            // todo: get this to stop doing it for all objects.
            let fabPath = options.path;
            pathToPoly(fabPath, canvas, paintBrush);
            customizeControls(fabPath);
            clearClassList(btnDraw);
            btnDraw.classList.add('btn');
            // canvas.off('mouse:down', mousedownHandler);
            // canvas.off("mouse:up", mouseupHandler);
            // TODO: implement save
            // console.log('PATH:\n', path);
        }

        function mouseupHandler(options) {
            // options gives you the PointerEvent object
            // Drawing off
            canvas.isDrawingMode = false;
            mToggle(true);
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
            mToggle(true);

        } else {
            // drawing on
            canvas.isDrawingMode = true;
            canvas.on('mouse:down', mousedownHandler);
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            mToggle(false);

        }
    });
}

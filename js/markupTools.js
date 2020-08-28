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
    let cellX = [], cellY = [];
    const sizeOfBox = 50;
    const width = canvas.width;
    const numBoxes = (width / sizeOfBox);
    for (let imoX = 0; imoX < numBoxes; imoX++) {
        cellX[imoX + 1] = imoX * sizeOfBox;
    }
    for (let imoY = 0; imoY < numBoxes; imoY++) {
        cellY[imoY + 1] = imoY * sizeOfBox;
    }

    let gridAdded = false;

    function makeLine(coords) {
        return new fabric.Line(coords, {
            stroke: "#ccc",
            strokeWidth: 2,
            selectable: false
        });
    }

    // Mouse move event-handler
    function mouseCoords(e) {
        let pointer = e.pointer;
        let cx = pointer.x;
        let cy = pointer.y;
        let ctx = viewer.drawer.context;
        // let cx = e.clientX; // undefined
        // let cy = e.clientY; // undefined
        // console.log('x, y', cx, cy);

        let x = cx / sizeOfBox;
        let y = cy / sizeOfBox;

        let imoX = Math.ceil(x + 0.001); // IsMouseOverX (mouse(block) position on grid)
        let imoY = Math.ceil(y + 0.001); // IsMouseOverY (mouse(block) position on grid)

        // TODO: fix
        ctx.fillStyle = "red";
        ctx.fillRect(cellX[imoX], cellY[imoY], sizeOfBox, sizeOfBox);

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
            for (let i = 0; i < numBoxes; i++) {
                canvas.add(makeLine([i * sizeOfBox, 0, i * sizeOfBox, width]));
                canvas.add(makeLine([0, i * sizeOfBox, width, i * sizeOfBox]));
            }
            btnGrid.innerHTML = 'Remove grid';
            gridAdded = true;
        }
        toggleButton(btnGrid);

    });

    // function onObjectSelected(e) {
    //     console.log(e.target.get('type'));
    // }
    // canvas.on('selection:created', onObjectSelected);

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
    }

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

    function souris(what) {
        viewer.setMouseNavEnabled(what);
        viewer.outerTracker.setTracking(what);
    }

    // todo: fix. it makes 2 on 2nd make line.
    function pathToPoly(fabPath) {

        let arr = fabPath.path;
        console.log('len', arr.length);

        // Reduce points before using in polygon
        // Or - make the poly, then reduce the controls
        let points = arr.reduce(
          function(accumulator, currentValue, currentIndex) {
              if (currentIndex % 10 === 0)
                  accumulator.push({x: arr[currentIndex][1], y: arr[currentIndex][2]});
              return accumulator;
          }, []);
        console.log('len', points.length);

        // Initiate a polygon instance
        let polygon = new fabric.Polygon(points, {
            stroke: mark.innerHTML,
            strokeWidth: paintBrush.width,
            fill: ''
        });

        // Render the polygon in canvas
        canvas.add(polygon);
        canvas.remove(fabPath);
    }

    // DRAW BUTTON
    btnDraw.addEventListener('click', function () {
        toggleButton(btnDraw);

        function pathCreatedHandler(options) {
            let line = options.path;
            let path = line.path;
            pathToPoly(line);
            customizeControls(path);
            clearClassList(btnDraw);
            btnDraw.classList.add('btn');
            canvas.off('mouse:down', mousedownHandler);
            // TODO: implement save
            // console.log('PATH:\n', path);
        }

        function mouseupHandler() {
            // Drawing off
            souris(true);
            canvas.isDrawingMode = false;
        }

        canvas.on("mouse:up", mouseupHandler);
        canvas.on("path:created", pathCreatedHandler);

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
            canvas.off('mouse:down', mousedownHandler);
            souris(true);
            canvas.isDrawingMode = false;
        } else {
            // drawing on
            canvas.on('mouse:down', mousedownHandler);
            paintBrush.color = mark.innerHTML;
            setBrushWidth(viewer);
            souris(false);
            canvas.isDrawingMode = true;
        }
    });

}

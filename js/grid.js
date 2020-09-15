/**
 * GRID handler
 * mouse:down
 * mouse:up
 * mouse:move
 */
function grid(idx, viewer, overlay) {

    const canvas = overlay.fabricCanvas();

    const btnGrid = document.getElementById('btnGrid' + idx);
    let cellX = [], cellY = [], cell_size = 50, gridAdded = false, dim_width, dim_height;

    function renderGrid(width, height, cell_width, cell_height, color) {

        let lineOption = { stroke: color, strokeWidth: 2, selectable: false }

        // Horizontal grid lines
        for (let y = 0; y < Math.ceil(height / cell_height); ++y) {
            canvas.add(new fabric.Line([0, y * cell_height, width, y * cell_height], lineOption));
            cellY[y + 1] = y * cell_height;
        }

        // Vertical grid lines
        for (let x = 0; x < Math.ceil(width / cell_width); ++x) {
            canvas.add(new fabric.Line([x * cell_width, 0, x * cell_width, height], lineOption));
            // cellX[x + 1] = x * cell_width;
            cellX[x] = x * cell_width;
        }
        canvas.renderAll();
        gridAdded = true;

    }

    // Grid button event handler
    btnGrid.addEventListener('click', function () {

        dim_width = Math.ceil(canvas.width);
        dim_height = Math.ceil(canvas.height);

        if (btnGrid.classList.contains('btnOn')) {
            // Remove only the lines
            let r = canvas.getObjects('line');
            for (let i = 0; i < r.length; i++) {
                canvas.remove(r[i]);
            }
            btnGrid.innerHTML = '<i class="fa fa-border-all"></i> Draw grid';
            gridAdded = false;

        } else {

            // DRAW GRID
            renderGrid(dim_width, dim_height, cell_size, cell_size, 'red');
            btnGrid.innerHTML = '<i class="fa fa-border-all"></i> Remove grid';
            gridAdded = true;
        }

        toggleButton(btnGrid);

    });


    // Grid Marker
    let btnMarker = document.getElementById('btnMarker' + idx);
    btnMarker.addEventListener('click', markerHandler);

    // Get coordinates of mouse pointer
    function mouseCoords(options) {
        let event = options.e;
        let pointer = canvas.getPointer(event);
        let rect = new fabric.Rect({
            left: Math.ceil(pointer.x),
            top: Math.ceil(pointer.y),
            fill: 'red',
            width: cell_size,
            height: cell_size,
            opacity: 0.5,
            selectable: false
        });
        canvas.add(rect); // TODO: snap-to
    }

    // Grid marker event handler
    function markerHandler() {
        let toggle = true;
        if (btnMarker.classList.contains('btnOn')) {
            // Remove mouse:move listener (we also use it for other things)
            canvas.off("mouse:move", mouseCoords);
            btnMarker.innerHTML = "<i class=\"fa fa-paint-brush\"></i> Mark grid";

        } else {
            if (!gridAdded) {
                toggle = false;
                alert("Please draw a grid first.");
            } else {
                // Add listener
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "<i class=\"fa fa-paint-brush\"></i> Done marking";
            }
        }
        if (toggle) {
            toggleButton(btnMarker);
        }
    }

}

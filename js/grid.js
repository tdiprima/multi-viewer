/**
 * GRID handler
 * mouse:down
 * mouse:up
 * mouse:move - to be.
 */
function Grid(button, viewer) {

    const overlay = viewer.fabricjsOverlay({ scale: 1000 });
    const canvas = overlay.fabricCanvas();
    let str = button.id;
    let idx = parseInt(str.charAt(str.length - 1));
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
    let toggle = false;

    function makeLine(coords) {
        return new fabric.Line(coords, {
            stroke: "#ccc",
            strokeWidth: 2,
            selectable: false
        });
    }

    // Mouse move event-handler
    function mouseCoords(e) {
        // let c = viewer.drawer.canvas;
        let pointer = e.absolutePointer;
        // let pointer = e.pointer;
        let ctx = viewer.drawer.context;
        // let cx = e.clientX; // get horizontal coordinate of mouse pointer
        // let cy = e.clientY; // vertical coordinate
        let cx = pointer.x;
        let cy = pointer.y;

        let x = cx / sizeOfBox;
        let y = cy / sizeOfBox;

        let imoX = Math.ceil(x + 0.001); // IsMouseOverX (mouse(block) position on grid)
        let imoY = Math.ceil(y + 0.001); // IsMouseOverY (mouse(block) position on grid)

        ctx.fillStyle = "red";
        ctx.fillRect(cellX[imoX], cellY[imoY], sizeOfBox, sizeOfBox);

    }

    button.addEventListener('click', function () {

        for (let prop in canvas.__eventListeners) {
            console.log('b', prop);
        }

        gridAdded = false;
        for (let i = 0; i < numBoxes; i++) {
            canvas.add(makeLine([i * sizeOfBox, 0, i * sizeOfBox, width]));
            canvas.add(makeLine([0, i * sizeOfBox, width, i * sizeOfBox]));
        }
        gridAdded = true;
        // $("#btnGrid").on("click", create_grid);

    });


    let btnMarker = document.getElementById('btnMarker' + idx);
    btnMarker.addEventListener('click', markerHandler);

    function markerHandler() {

        if (toggle) {
            canvas.off("mouse:move", mouseCoords);
            btnMarker.innerHTML = "Activate marker";
            toggle = false;

        } else {
            if (!gridAdded) {
                alert("Add a grid first!");
            }
            else {
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "Marker activated";
                toggle = true;
            }
        }
    }

}

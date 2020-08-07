/**
 * GRID handler
 */
function Grid(button, viewer) {

    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });

    const canvas = overlay.fabricCanvas();
    let idx = button.id.trim(-1).replace("btnGrid", "");

    function makeLine(coords) {
        return new fabric.Line(coords, {
            stroke: "#ccc",
            strokeWidth: 2,
            selectable: false
        });
    }

    function create_grid() {
        console.log('here')
        // TODO: It goes from the top of the image, to the
        // bottom of the div; not the image.
        // TODO: p.s. Why are we all shakey in & out again?

        for (let i = 0; i < numBoxes; i++) {
            canvas.add(makeLine([i * sizeOfBox, 0, i * sizeOfBox, width]));
            canvas.add(makeLine([0, i * sizeOfBox, width, i * sizeOfBox]));
        }
        gridAdded = true;

    }

    function toggle() {
        // let c = document.getElementById("osd-overlaycanvas-" + idx)
        if (prawn) {
            canvas.off("mousemove", mouseCoords);
            prawn = false;
            btnMarker.innerHTML = "Activate Marker";

        } else {
            if (!gridAdded) {
                alert("Add a grid first!");
            }
            else {
                canvas.on("mousemove", mouseCoords);
                prawn = true;
                btnMarker.innerHTML = "Marker Activated";
            }
        }

    }

    // Mouse move event-handler
    function mouseCoords(e) {
        let canvas = document.getElementById("osd-overlaycanvas-" + idx);
        let ctx = canvas.getContext("2d");
        let cx = e.clientX; // get horizontal coordinate of mouse pointer
        let cy = e.clientY; // vertical coordinate
        let x = cx / sizeOfBox;
        let y = cy / sizeOfBox;
        let imoX = Math.ceil(x + 0.001); // IsMouseOverX (mouse(block) position on grid)
        let imoY = Math.ceil(y + 0.001); // IsMouseOverY (mouse(block) position on grid)
        // TODO: Adjust as necessary...
        ctx.fillStyle = "red";
        ctx.fillRect(cellX[imoX], cellY[imoY], sizeOfBox, sizeOfBox);
    }

    button.addEventListener('click', function () {

        // TODO: TEMP
        for (var prop in canvas.__eventListeners) {
            console.log(prop);
        }

        let sizeOfBox = 50;
        let width = canvas.width;
        let numBoxes = (width / sizeOfBox);

        let gridAdded = false;

        $("#btnGrid").on("click", create_grid);

        let prawn = false;
        let btnMarker = document.getElementById('btnMarker' + idx);


        btnMarker.addEventListener('click', toggle);

        // Save array of cell coordinates
        // TODO: eh. wrong.
        let cellX = [], cellY = [];
        for (let imoX = 0; imoX < numBoxes; imoX++) {
            cellX[imoX + 1] = imoX * sizeOfBox;
        }
        for (let imoY = 0; imoY < numBoxes; imoY++) {
            cellY[imoY + 1] = imoY * sizeOfBox;
        }



    });
}

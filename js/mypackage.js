/**
 * Attach custom color picker to toolbar
 * @param elem
 * @constructor
 */
function Color(elem) {
    let picker = new CP(elem);
    picker.self.classList.add('no-alpha');

    // Disable the default blur and focus behavior
    picker.on('blur', function () { });
    picker.on('focus', function () { });

    // Set color value and style
    picker.on('change', function (r, g, b) {
        this.source.value = this.color(r, g, b, 1);
        this.source.innerHTML = this.color(r, g, b, 1);
        this.source.style.backgroundColor = this.color(r, g, b, 1);
    });

    // Show and hide color picker panel with a click
    picker.source.addEventListener('click', function (e) {
        picker.enter();
        e.stopPropagation();
    }, false);

    document.documentElement.addEventListener('click', function () {
        picker.exit();
    }, false);

}
let demo = function () {

}

demo.execute = function (num_viewers, prod, options) {
    // Variables
    const arr = [];
    const style = "dragonbox";
    const iiif = window.location.origin + "/iiif/?iiif=/tcgaseg";
    const id = "blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E";

    if (!options) {
        // default
        options = {
            filterOn: true,
            slidersOn: true,
            toolbarOn: true,
            multipleOn: true,
            paintbrushColor: "#0ff",
            viewerOpts: {
                showFullPageControl: false,
                showHomeControl: true,
                showZoomControl: false
            }
        }

        // default if single viewer
        if (num_viewers === 1) {
            options = {
                filterOn: true,
                slidersOn: true,
                toolbarOn: false,
                multipleOn: false,
                paintbrushColor: "#0ff"
            }
        }
    }

    // Create viewer(s)
    for (let i = 0; i < num_viewers; i++) {
        let v = new nViewer("viewer" + i, style, "viewers", options);
        arr.push(v);
    }

    // Viewers created; add dropdown to page
    new Dropdown(arr, 'selections', './json/tcga.json');

    function test() {
        // TESTING
        let dzi = "//openseadragon.github.io/example-images/duomo/duomo.dzi";
        arr.forEach(function (elem) {
            elem.getViewer().open(dzi)
        });
    }

    function live() {
        // Set viewer source
        arr.forEach(function (elem) {
            elem.setSources([iiif + "/tcgaimages/" + id + ".svs/info.json",
            iiif + "/featureimages/" + id + "-featureimage.tif/info.json"],
                [1.0, 1.0]);
        });
    }

    if (prod) {
        live();
    } else {
        test();
    }

    // Pan zoom controller
    sync = new Synchronizer(arr);  // Pass array of nViewers
}
/**
 * Attach dropdowns to div
 * Select cancer type and slide
 */
class Dropdown {
    constructor(viewerArray, divId, dataSource) {

        const cancertypes = ["blca", "brca", "cesc", "gbm", "luad", "lusc", "paad", "prad", "skcm", "ucec"];
        const maindiv = document.getElementById(divId);
        // const iiif = "https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg";
        const iiif = window.location.origin + "/iiif/?iiif=/tcgaseg";
        let cancerSelect = {};
        let imageSelect = {};
        let data = {};
        initialize();

        // Speed up calls to hasOwnProperty
        let hasOwnProperty = Object.prototype.hasOwnProperty;

        function isEmpty(obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== "object") return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        }

        function initialize() {
            let getSlideData = async function () {
                return (await fetch(dataSource)).json();
            };
            let x = getSlideData();
            x.then(function (result) {
                data = result;
                if (!isEmpty(data)) {
                    initTypes();
                    initImages();
                }
            });
        }

        function selectCancerType() {
            let val = cancerSelect.value;
            imageSelect.options.length = 0;
            let nl = data[val];
            for (let i = 0; i < nl.length; i++) {
                let option = document.createElement("option");
                option.text = nl[i].id;
                imageSelect.add(option);
            }
            console.log("You selected: " + val + " which has " + imageSelect.options.length + " images");
            selectImage();
        }

        function imageExists(image_url) {

            let http = new XMLHttpRequest();
            http.open('HEAD', image_url, false);
            http.send();
            return http.status !== 404;

        }

        function selectImage() {
            let cVal = cancerSelect.value;
            let iVal = imageSelect.value;
            console.log("setting viewer to image : " + iVal);
            let ti = iiif + "/tcgaimages/" + cVal + "/" + iVal + ".svs/info.json";
            let si = iiif + "/featureimages/" + cVal + "/" + iVal + "-featureimage.tif/info.json";

            if (imageExists(ti)) {
                // Do something now that you know the image exists.
                viewerArray.forEach(function (elem) {
                    elem.getViewer().open([ti, si]);
                });
            } else {
                // Image doesn't exist - do something else.
                alert('Image does not exist\n' + ti);
                return false;
            }

        }

        function initTypes() {
            let d = document.createDocumentFragment();
            let newDiv = document.createElement("div");
            newDiv.innerHTML = "Type&nbsp;";
            d.appendChild(newDiv);
            cancerSelect = document.createElement('select');
            cancerSelect.id = "cancertype";
            cancertypes.forEach(function (item) {
                let opt = document.createElement('option');
                opt.innerHTML = item;
                opt.value = item;
                cancerSelect.appendChild(opt);
            });
            cancerSelect.addEventListener("change", selectCancerType);
            newDiv.appendChild(cancerSelect);
            maindiv.appendChild(d);
        }

        function initImages() {

            let images = data[cancertypes[0]];
            if (typeof images !== 'undefined') {
                let d = document.createDocumentFragment();
                let newDiv = document.createElement("div");
                newDiv.innerHTML = "Image&nbsp;";
                d.appendChild(newDiv);
                imageSelect = document.createElement("select");
                imageSelect.id = "imageids";

                images.forEach(function (item) {
                    let opt = document.createElement('option');
                    opt.innerHTML = item.id;
                    opt.value = item.id;
                    imageSelect.appendChild(opt);
                });
                imageSelect.addEventListener("change", selectImage);
                newDiv.appendChild(imageSelect);
                maindiv.appendChild(d);
            }
        }
    }
}
/**
 * Handler for right-click, add map marker.
 * @param currentViewer
 * @param syncedViewers
 */
map_marker = function (currentViewer, syncedViewers) {

    // const idx = currentViewer.id.trim(-1).replace("viewer", "");

    // prevent modal
    $(currentViewer.element).on('contextmenu', function (event) {
        event.preventDefault();
    });

    // right-click
    currentViewer.addHandler('canvas-nonprimary-press', (event) => {
        if (event.button === 2) { // Right mouse
            const webPoint = event.position;
            const viewportPoint = currentViewer.viewport.pointFromPixel(webPoint);
            // document.getElementById("btnMap" + idx).style.display = 'block';
            document.querySelectorAll('#toggle-overlay').forEach(function (item) {
                item.style.display = 'block';
            });
            displayPinIcon(viewportPoint);
        }
    });

    function createLink() {
        // let rand = Math.floor(Math.random() * 11);
        let link = document.createElement('a');
        let href = "#";
        link.href = href;
        link.dataset.href = href;
        link.id = 'map-marker';
        // link.id = 'map-marker-' + rand;
        link.className = 'fa fa-map-marker';
        link.style.cssText =
            ' text-decoration: none; font-size: 22px; color: red;' +
            ' cursor: pointer';
        return link;
    }

    function doOverlay(point, viewer) {
        // console.log('v', viewer.overlaysContainer.children);
        let link = createLink();
        viewer.addOverlay({
            element: link,
            location: point,
            placement: 'BOTTOM',
            checkResize: false
        });
        mouseTracker(link, viewer);
        // viewer.removeOverlay()

    }

    // display map marker
    function displayPinIcon(point) {
        const all = true; // temporarily
        if (all) {
            // Show on all other viewers
            syncedViewers.forEach(function (item) {
                let viewer = item.getViewer()
                if (viewer.id === currentViewer.id) {
                    return;
                }
                doOverlay(point, viewer);
            });
        } else {
            // Show only on this viewer
            doOverlay(point, currentViewer)
        }
    }

    function mouseTracker(link, viewer) {
        // TBA
        new OpenSeadragon.MouseTracker({
            element: link,
            clickHandler: function () {
                console.log('clickHandler');
                // etc
            },
            dragHandler: function () {
                console.log('dragHandler');
                // etc
            }
        });
    }


    let elementList = document.querySelectorAll('#toggle-overlay');
    elementList.forEach(function (elem) {
        let overlay = false;
        let s, h;
        elem.addEventListener('click', function () {
            if (overlay) {
                s = 'block';
                h = "<i class=\"fa fa-map-marker\"></i> Hide markers";
            }
            else {
                s = 'none';
                h = "<i class=\"fa fa-map-marker\"></i> Show markers";
            }
            this.innerHTML = h;
            document.querySelectorAll('#map-marker').forEach(function (thing) {
                thing.style.display = s;
            })
            overlay = !overlay;
        })
    });

}
function markupTools(idx, viewer) {

    // const obj = fb.create(viewer);
    // const overlay = obj.o;
    // const canvas = obj.c;
    const overlay = viewer.fabricjsOverlay({
        scale: 1000
    });
    const canvas = overlay.fabricCanvas();

    const btnGrid = document.getElementById('btnGrid' + idx);
    const btnPolygon = document.getElementById('btnPolygon' + idx);
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

    btnGrid.addEventListener('click', function () {

        gridAdded = false;
        for (let i = 0; i < numBoxes; i++) {
            canvas.add(makeLine([i * sizeOfBox, 0, i * sizeOfBox, width]));
            canvas.add(makeLine([0, i * sizeOfBox, width, i * sizeOfBox]));
        }
        gridAdded = true;

    });

    let btnMarker = document.getElementById('btnMarker' + idx);
    btnMarker.addEventListener('click', markerHandler);

    function markerHandler() {

        if (btnMarker.classList.contains('btnOn')) {
            canvas.off("mouse:move", mouseCoords);
            btnMarker.innerHTML = "Activate marker";

        } else {
            if (!gridAdded) {
                alert("Add a grid first!");
            } else {
                canvas.on("mouse:move", mouseCoords);
                btnMarker.innerHTML = "Marker activated";
            }
        }
        toggleButton(btnMarker);
    }

    /**
     * POLYGON handler
     */

    let roof = new fabric.Polyline();
    let roofPoints = [];
    let lines = [];
    let lineCounter = 0;

    let drawingObject = {
        type: '',
        background: '',
        border: ''
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function isRealValue(obj) {
        return obj && obj !== 'null' && obj !== 'undefined';
    }


    btnPolygon.addEventListener('click', function () {
        toggleButton(btnPolygon);
        if (drawingObject.type === "roof") {
            drawingObject.type = "";
            lines.forEach(function (value) {
                canvas.remove(value);
            });
            roof = makeRoof(roofPoints);
            canvas.add(roof);
            canvas.renderAll();
        } else {
            drawingObject.type = "roof"; // roof type
        }
    });

    // Canvas Drawing
    let x = 0;
    let y = 0;

    // Double-click = finish.
    canvas.on('mouse:dblclick', finishPolygon);

    function finishPolygon() {

        toggleButton(btnPolygon);

        drawingObject.type = "";
        lines.forEach(function (value) {
            canvas.remove(value);
        });

        roof = makeRoof(roofPoints);

        if (Array.isArray(roof.points) && roof.points.length) {
            canvas.add(roof);
            canvas.renderAll();
        }

        //clear arrays
        roofPoints = [];
        lines = [];
        lineCounter = 0;
        viewer.gestureSettingsMouse.clickToZoom = true;
    }

    function canvasSelect() {
        canvas.selection = true;
    }

    // Add points
    function addPoints(options) {

        viewer.gestureSettingsMouse.clickToZoom = false;
        if (drawingObject.type === "roof") {
            canvas.selection = false;
            setStartingPoint(options); // set x,y
            roofPoints.push(new Point(x, y));
            let points = [x, y, x, y];
            lines.push(new fabric.Line(points, {
                strokeWidth: 3,
                selectable: false,
                stroke: 'red'
            }));
            // }).setOriginX(x).setOriginY(y));
            canvas.add(lines[lineCounter]);
            lineCounter++;
            canvas.on('mouse:up', canvasSelect);
        } else {
            viewer.gestureSettingsMouse.clickToZoom = true;
            // Disable fabric selection; otherwise, you get the weird purple box.
            overlay._fabricCanvas.selection = false;
        }
    }

    canvas.on('mouse:down', addPoints);

    function calculateLines(options) {
        if (isRealValue(lines[0]) && drawingObject.type === "roof") {
            setStartingPoint(options);
            lines[lineCounter - 1].set({
                "x2": x,
                "y2": y
            });
            canvas.renderAll();
        }
    }

    canvas.on('mouse:move', calculateLines);

    canvas.on("after:render", function () {
        canvas.calcOffset();
    });

    function setStartingPoint(options) {
        // clientX, offsetX, pageX
        // let offset = $('#canvas-tools').offset();
        // x = options.e.pageX - offset.left;
        // y = options.e.pageY - offset.top;
        x = options.e.pageX - canvas._offset.left;
        y = options.e.pageY - canvas._offset.top;
    }

    function makeRoof(roofPoints) {
        let left = findPaddingForRoof(roofPoints, 'x');
        let top = findPaddingForRoof(roofPoints, 'y');

        if (left !== 999999 && top !== 999999) {
            roofPoints.push(new Point(roofPoints[0].x, roofPoints[0].y));
            roof = new fabric.Polyline(roofPoints, {
                strokeWidth: 3,
                fill: 'rgba(0,0,0,0)',
                stroke: 'green'
                // stroke: '#58c'
            });
            roof.set({
                left: left,
                top: top,
            });
        }
        return roof;
    }

    function findPaddingForRoof(roofPoints, coord) {
        let result = 999999;
        for (let i = 0; i < lineCounter; i++) {
            if (roofPoints[i][coord] < result) {
                result = roofPoints[i][coord];
            }
        }
        return Math.abs(result);
    }

    /**
     * FreeDrawing handler
     */


    const paintBrush = overlay.fabricCanvas().freeDrawingBrush;
    const mark = document.getElementById('mark' + idx);
    paintBrush.color = mark.innerHTML;

    function customizeControls(obj) {
        // For the object that was drawn
        obj['hasControls'] = false;
        obj.lockMovementX = true; // hold in place
        obj.lockMovementY = true;

        function addDeleteBtn(x, y, el) {
            $(".deleteBtn").remove();
            let btnLeft = x - 10;
            let btnTop = y - 10;
            let deleteBtn = document.createElement('img');
            deleteBtn.src = "./img/delete-icon.png";
            deleteBtn.classList.add('deleteBtn')
            deleteBtn.style = `position:absolute;top:${btnTop}px;left:${btnLeft}px;cursor:pointer;width:20px;height:20px;`;
            deleteBtn.alt = "delete object";
            el.appendChild(deleteBtn);
        }

        canvas.on('selection:created', function (e) {
            let el = this.lowerCanvasEl.parentElement;
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        })

        canvas.on('mouse:down', function () {
            // For example, panning or zooming after selection
            if (!canvas.getActiveObject()) {
                $(".deleteBtn").remove();
                viewer.gestureSettingsMouse.clickToZoom = true;
            } else {
                // Make sure the viewer doesn't zoom when we click the delete button.
                viewer.gestureSettingsMouse.clickToZoom = false;
            }
        });

        // Handle all the things
        canvas.on('object:modified', function (e) {
            let el = this.lowerCanvasEl.parentElement;
            addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y, el);
        });

        canvas.on('object:scaling', function () {
            $(".deleteBtn").remove();
        });

        canvas.on('object:moving', function () {
            $(".deleteBtn").remove();
        });

        canvas.on('object:rotating', function () {
            $(".deleteBtn").remove();
        });

        $(".canvas-container").on('click', ".deleteBtn", function () {

            // this = deleteBtn
            if (canvas.getActiveObject()) {
                canvas.remove(canvas.getActiveObject());
                $(".deleteBtn").remove();
            }
            // Delete finished; re-enable zoom.
            viewer.gestureSettingsMouse.clickToZoom = true;
        });

    }

    function saveCoordinates(d) {
        // TBA
    }

    function setBrushWidth(viewer) {
        paintBrush.width = 10 / viewer.viewport.getZoom(true);
    }



    // param: viewer, button, canvas
    function toggleDraw(v, btn, c) {
        let mouseTracker = v.outerTracker;

        if (btn.classList.contains('btnOn')) {
            // End Draw
            v.setMouseNavEnabled(true);
            mouseTracker.setTracking(true);
            c.isDrawingMode = false;
        } else {
            // Start Draw
            v.setMouseNavEnabled(false);
            mouseTracker.setTracking(false);
            c.isDrawingMode = true;
        }

        toggleButton(btn);
    }

    // EVENT LISTENERS

    // START DRAW
    btnDraw.addEventListener('click', function () {

        paintBrush.color = mark.innerHTML;
        setBrushWidth(viewer);
        toggleDraw(viewer, btnDraw, canvas);

    });

    // END DRAW
    canvas.on("path:created", function (e) {
        toggleDraw(viewer, btnDraw, canvas);
        let d = e.path;
        customizeControls(d);
        saveCoordinates(d);
        // console.log('PATH:\n', e.path.path);

    });

}
/**
 * Wrapper object for the osd viewers
 */
class nViewer {
    constructor(viewerDivId, cssName, mainDiv, options) {

        let idx = viewerDivId.replace("viewer", "");
        let myFilter = {};
        let sliders = [];
        let chkPan = {};
        let chkZoom = {};
        let viewer = {};
        mainDiv = document.getElementById(mainDiv);

        setFilter();
        setViewer();

        this.getViewer = function () {
            return viewer;
        };

        this.getChkPan = function () {
            return chkPan.checked;
        };

        this.getChkZoom = function () {
            return chkZoom.checked;
        };

        this.getViewer = function () {
            return viewer;
        };

        // this.modOptions = function (numViewers) {
        //     if (numViewers > 1) {
        //         options.multipleOn = true;
        //     } else {
        //         options.multipleOn = false;
        //     }
        //     console.log(options);
        // }

        /**
         * @param imageArray
         * @param opacityArray
         */
        this.setSources = function (imageArray, opacityArray) {

            imageArray.forEach(function (image, index) {
                // add images to viewer
                viewer.addTiledImage({ tileSource: image, opacity: opacityArray ? opacityArray[index] : 0, x: 0, y: 0 });
            });

            viewer.world.addHandler("add-item", function (data) {

                if (viewer.world.getItemCount() === 2) {
                    // colorize layer 2
                    viewer.setFilterOptions({
                        filters: [{
                            items: viewer.world.getItemAt(1),
                            processors: [
                                myFilter.prototype.COLORIZE(0, 255, 0)
                            ]
                        }]
                    });

                    viewer.world.getItemAt(1).source.getTileUrl = function (level, x, y) {
                        let IIIF_ROTATION = '0', scale = Math.pow(0.5, this.maxLevel - level),
                            levelWidth = Math.ceil(this.width * scale), levelHeight = Math.ceil(this.height * scale), tileSize,
                            iiifTileSize, iiifTileSizeWidth, iiifTileSizeHeight, iiifRegion, iiifTileX, iiifTileY, iiifTileW,
                            iiifTileH, iiifSize, iiifQuality, uri;
                        tileSize = this.getTileWidth(level);
                        iiifTileSize = Math.ceil(tileSize / scale);
                        iiifTileSizeHeight = iiifTileSize;
                        iiifTileSizeWidth = iiifTileSize;
                        iiifQuality = "default.png";
                        if (levelWidth < tileSize && levelHeight < tileSize) {
                            iiifSize = levelWidth + ",";
                            iiifRegion = 'full';
                        } else {
                            iiifTileX = x * iiifTileSizeWidth;
                            iiifTileY = y * iiifTileSizeHeight;
                            iiifTileW = Math.min(iiifTileSizeWidth, this.width - iiifTileX);
                            iiifTileH = Math.min(iiifTileSizeHeight, this.height - iiifTileY);
                            iiifSize = Math.ceil(iiifTileW * scale) + ",";
                            iiifRegion = [iiifTileX, iiifTileY, iiifTileW, iiifTileH].join(',');
                        }
                        uri = [this['@id'], iiifRegion, iiifSize, IIIF_ROTATION, iiifQuality].join('/');
                        return uri;
                    };
                }
            });

        };

        function setControls(div) {
            let d = document.createDocumentFragment();
            let dd = document.createElement('div');

            // SLIDERS
            if (options.slidersOn) {
                let len = 2;
                for (let i = 0; i < len; i++) {
                    let range = document.createElement('input');
                    range.type = "range";
                    range.id = "sliderRange" + i;
                    range.min = "0";
                    range.max = "100";
                    range.value = "100";
                    range.setAttribute('class', "slider-square");
                    if (options.toolbarOn) {
                        range.style.display = "none"; // bc we have a btn to toggle it
                    }
                    dd.appendChild(range); // append range to div
                    d.appendChild(dd); // append div to fragment
                    div.appendChild(d); // append fragment to parent
                    sliders.push(range);
                }
            }

            // TOOLBAR
            if (options.toolbarOn) {
                new Toolbar(div, idx, sliders, options).menu();
                // CHECKBOXES
                if (options.multipleOn) {
                    chkPan = document.getElementById("chkPan" + idx);
                    chkZoom = document.getElementById("chkZoom" + idx);
                }
            }
        }

        /**
         * INITIALIZE
         */
        function setViewer() {
            let diva = document.createElement('div');
            diva.setAttribute('class', 'nViewer');
            mainDiv.appendChild(diva);
            setControls(diva);
            let div = document.createElement('div');
            div.id = viewerDivId;
            div.setAttribute('class', cssName);
            diva.appendChild(div);

            if (!options.viewerOpts) {
                options.viewerOpts = {
                    showFullPageControl: true,
                    showHomeControl: true,
                    showZoomControl: true
                }
            }

            viewer = OpenSeadragon({
                id: viewerDivId,
                showFullPageControl: options.viewerOpts.showFullPageControl,
                showHomeControl: options.viewerOpts.showHomeControl,
                prefixUrl: "./js/lib/openseadragon/images/",
                showZoomControl: options.viewerOpts.showZoomControl,
                crossOriginPolicy: 'Anonymous'
            });

            // DRAWING TOOLS
            if (options.toolbarOn) {
                new markupTools(idx, viewer);
            }

            // SLIDER EVENT LISTENER
            if (options.slidersOn) {
                for (let i = 0; i < sliders.length; i++) {
                    sliders[i].addEventListener("input", function () {
                        if (viewer.world.getItemAt(i) !== undefined) {
                            viewer.world.getItemAt(i).setOpacity(sliders[i].value / 100);
                        } else {
                            sliders[i].hidden = true;
                        }
                    });
                }
            }

            if (options.filterOn) {
                // FILTERING
                viewer.setFilterOptions({
                    filters: [{
                        items: viewer.world.getItemAt(1),
                        processors: [
                            myFilter.prototype.COLORIZE(0, 255, 0)
                        ]
                    }]
                });
            }

        }

        function setFilter() {
            myFilter = OpenSeadragon.Filters.GREYSCALE;
            myFilter.prototype.COLORIZE = function (r, g, b) {
                return function (context, callback) {
                    let imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
                    let pixels = imgData.data;
                    for (let i = 0; i < pixels.length; i += 4) {
                        let avg = pixels[i] / 255;
                        if (pixels[i + 3] === 255) {
                            pixels[i] = r * avg;
                            pixels[i + 1] = g * avg;
                            pixels[i + 2] = b * avg;
                            pixels[i + 3] = avg * 255;
                        } else if (pixels[i] > 0) {
                            pixels[i + 3] = 0;
                        }
                    }
                    context.putImageData(imgData, 0, 0);
                    callback();
                };
            };
        }
    }
}
/**
 * Handles synchronization of the viewers
 */
class Synchronizer {
    constructor(viewerArray) {

        // let len = viewerArray.length;
        // viewerArray.forEach(element => element.modOptions(len));

        let syncedViewers = []; // array of synchronized viewers
        let activeViewerId = null; // magic init

        // Loop through array of n-viewers
        viewerArray.forEach(function (elem) {
            // Created viewer already.
            let currentViewer = elem.getViewer();

            // Add handlers
            currentViewer.addHandler('pan', handler);
            currentViewer.addHandler('zoom', handler);
            map_marker(currentViewer, syncedViewers);

            function handler() {
                // My viewer is clicked, I'm the active viewer
                // start magic
                if (activeViewerId == null) {
                    activeViewerId = currentViewer.id;
                }
                if (activeViewerId !== currentViewer.id) {
                    return;
                }
                // end magic

                // As for everybody else...
                syncedViewers.forEach(function (item) {
                    let view = item.getViewer()
                    if (view.id === currentViewer.id) {
                        return;
                    }

                    // other viewers' coords set to my coordinates
                    // EXCEPT...
                    if (item.getChkPan() && elem.getChkPan()) {
                        view.viewport.panTo(currentViewer.viewport.getCenter());
                    }
                    if (item.getChkZoom() && elem.getChkZoom()) {
                        view.viewport.zoomTo(currentViewer.viewport.getZoom());
                    }

                });
                // magic support
                activeViewerId = null;
            }
            syncedViewers.push(elem);  // add our [viewer] to our list
        });
    }
}
/**
 * Match pan, match zoom, show sliders, color options, 'draw' button, toggle marker.
 * @param div
 * @param idx
 * @param sliders
 * @param options
 * @constructor
 */
function Toolbar(div, idx, sliders, options) {
    let div1 = document.createElement('div');
    let innerHtml;
    let color = "#00f";

    if (options.paintbrushColor) {
        color = options.paintbrushColor;
    }

    // Pan and Zoom checkboxes
    if (options.multipleOn) {
        innerHtml = `<input type="checkbox" id="chkPan${idx}" checked><label for="chkPan${idx}">Match Pan</label>&nbsp;&nbsp;
    <input type="checkbox" id="chkZoom${idx}" checked><label for="chkZoom${idx}">Match Zoom</label>&nbsp;&nbsp;`;
    } else {
        innerHtml = '';
    }

    innerHtml += `<a data-page="fold${idx}" href="#"><i class="fa fa-list-alt" aria-hidden="true"></i> Menu</a>`

    /**
     * Fold-out menu
     */
    this.menu = function name() {
        innerHtml += `<div class="fold scrollmenu" id="fold${idx}" style="max-width:400px;margin:0 auto;">
        <a href="#"><mark id="mark${idx}" style="background-color: rgb(0, 255, 255);">#00ffff</mark></a>
        <a id="btnDraw${idx}" class="btn" href="#"><i class="fa fa-pencil-alt"></i> Draw</a>
        <a id="btnPolygon${idx}" class="btn" href="#"><i class="fa fa-draw-polygon"></i> Draw polygon</a>
        <a id="btnGrid${idx}" class="btn" href="#"><i class="fa fa-border-all"></i> Draw grid</a>
        <a id="btnMarker${idx}" class="btn" href="#"><i class="fa fa-paint-brush"></i> Activate marker</a>
        <a id="btnSlide${idx}" class="btn" href="#"><i class="fa fa-sliders"></i> Show sliders</a>
        <a id="toggle-overlay" style="display: none" href="#"><i class="fa fa-map-marker-alt"></i> Hide markers</a>
    </div>`;

        // Attach toolbar
        div1.innerHTML = innerHtml;
        div.appendChild(div1);

        // let blah = document.getElementById('blah' + idx);
        // blah.addEventListener('click', function () {
        //     alert('blah!');
        //     // return false;
        // });

        // Menu animation
        $("a").on('click', function () {
            let page = $(this).data("page");
            if (typeof page === "undefined")
                return;

            let ind = page.trim(-1).replace("fold", "");

            if (ind === idx) {
                if ($('div:animated').id !== page) {

                    let active = $(".fold.active");
                    // if there is visible fold element on page (user already clicked at least once on link)
                    if (active.length) {

                        // Close it
                        active.animate({
                            width: "0"
                        }, 200)
                            .animate({
                                height: "0"
                            }, 100, function () {
                                // this happens after above animations are complete
                                $(this).removeClass("active");

                            })

                    } else {
                        // Open it
                        $("#" + page)
                            .addClass("active")
                            .animate({
                                height: "75px"
                            }, 100, 'linear')
                            .animate({
                                width: "500px"
                            }, 100, 'linear')
                    }
                }
            }
        });

        // Slider
        sliderEvt();

        // Color & paint
        colorDrawEvt();

        // temp();

    }

    /**
     * Buttons
     */
    this.buttons = function () {

        // Slider button
        let btnSlide = `<button class="btn" id="btnSlide${idx}"><i class="fa fa-sliders"></i> Show sliders</button>&nbsp;&nbsp;`;

        // FreeDrawing buttons handled by draw.js
        let wPaint = `<mark id='mark${idx}'>${options.paintbrushColor}</mark>&nbsp;&nbsp;`;
        let btnDraw = `<button class="btn" id="btnDraw${idx}"><i class="fa fa-pencil-alt"></i> Draw</button>&nbsp;&nbsp;`;

        // Map markers handled by map-marker.js
        // TODO: A toggle for each. (This one does everything.)  Or not!
        let btnMapMarker = `<button class="btn" id="toggle-overlay" style="display: none"><i class="fa fa-map-marker"></i> Hide markers</button>&nbsp;&nbsp;`;

        // Polygon - NEW!
        let btnPolygon = `<button class="btn" id="btnPolygon${idx}"><i class='fas fa-draw-polygon'></i> Draw Polygon</button>&nbsp;&nbsp;`;

        // Grid - NEW!
        let btnGrid = `<button class="btn" id="btnGrid${idx}">Draw Grid&nbsp;&nbsp;`;

        // Attach toolbar to viewer
        div1.innerHTML = innerHtml + wPaint + btnDraw + (options.slidersOn ? btnSlide : "") + btnPolygon + btnGrid + btnMapMarker;
        div.appendChild(div1);

        // Slider
        sliderEvt();

        // Drawing tools
        colorDrawEvt();

        // temp();
    }


    function temp() {
        // TODO:
        document.getElementById("btnPolygon" + idx).addEventListener('click', function () {
            alert("Coming real soon!");
        });
        document.getElementById('btnGrid' + idx).addEventListener('click', function () {
            alert("Coming real soon!");
        })
    }

    function colorDrawEvt() {
        // Color picker event handler
        new Color(document.getElementById('mark' + idx));
    }

    function sliderEvt() {
        // Slider button event handler
        if (options.slidersOn) {
            let sld = document.getElementById("btnSlide" + idx);
            if (sld !== null) {
                sld.addEventListener('click', function () {

                    let x = sliders[0];
                    if (x.style.display === 'none') {
                        x.style.display = 'inline';
                        sliders[1].style.display = 'inline';
                        this.innerHTML = "<i class=\"fa fa-sliders\"></i> Hide sliders";
                    } else {
                        x.style.display = 'none';
                        sliders[1].style.display = 'none';
                        this.innerHTML = "<i class=\"fa fa-sliders\"></i> Show sliders";
                    }
                });
            }
        }
    }
}

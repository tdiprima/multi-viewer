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

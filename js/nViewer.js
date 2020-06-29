class nViewer {
    constructor(divId, cssName, maindiv = "viewers", options1) {
        // let options = { filterOn: true, slidersOn: true, toolbarOn: true, multipleOn: true };
        // if (options1) {
        //     if (typeof options1.filterOn !== 'undefined') {
        //         options.filterOn = options1.filterOn;
        //     }
        //     if (typeof options1.slidersOn !== 'undefined') {
        //         options.slidersOn = options1.slidersOn;
        //     }
        //     if (typeof options1.toolbarOn !== 'undefined') {
        //         options.toolbarOn = options1.toolbarOn;
        //     }
        // }

        let idx = divId.replace("viewer", "");
        let myFilter = {};
        let sliders = [];
        let chkPan = {};
        let chkZoom = {};
        let viewer = {};
        maindiv = document.getElementById(maindiv);

        if (options.filterOn) {
            setFilter();
        }
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

            if (options.slidersOn) {
                // Sliders
                let len = 2;
                for (let i = 0; i < len; i++) {
                    let range = document.createElement('input');
                    range.type = "range";
                    range.id = "sliderRange" + i;
                    range.min = "0";
                    range.max = "100";
                    range.value = "100";
                    range.setAttribute('class', "slider-square");
                    range.style.display = "none";
                    dd.appendChild(range); // append range to div
                    d.appendChild(dd); // append div to fragment
                    div.appendChild(d); // append fragment to parent
                    sliders.push(range);
                }
            }

            if (options.toolbarOn) {
                new Toolbar(div, idx, sliders, options);
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
            let div = document.createElement('div');
            div.id = divId;
            div.setAttribute('class', cssName);
            maindiv.appendChild(div);
            setControls(div);

            viewer = OpenSeadragon({
                id: divId,
                prefixUrl: "//openseadragon.github.io/openseadragon/images/",
                showNavigationControl: false,
                crossOriginPolicy: 'Anonymous'
            });
            // viewer.setControlsEnabled(false);

            if (options.toolbarOn) {
                let p = new Paint(document.getElementById('btnDraw' + idx), viewer);
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

            if (options.sfilterOn) {
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

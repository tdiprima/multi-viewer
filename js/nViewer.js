/**
 * Wrapper object for the osd viewers
 */
class nViewer {
    constructor(viewerDivId, sliders, options) {
        // console.log(viewerDivId, sliders, options);

        let idx = viewerDivId.replace("viewer", "");
        let myFilter = {};
        let viewer = {};

        // Checkboxes
        let chkPan = {}, chkZoom = {};
        if (num_divs > 1 && options.toolbarOn) {
            chkPan = document.getElementById("chkPan" + idx);
            chkZoom = document.getElementById("chkZoom" + idx);
        }

        setFilter();
        setViewer(viewerDivId);

        this.getViewer = function () {
            return viewer;
        };

        this.getChkPan = function () {
            if (typeof chkPan.checked !== 'undefined') {
                return chkPan.checked; // user decision
            } else {
                if (num_divs === 1) {
                    return false; // nothing to synchronize
                }
                else {
                    return true; // default: keep in sync
                }
            }
        };

        this.getChkZoom = function () {
            if (typeof chkZoom.checked !== 'undefined') {
                return chkZoom.checked; // user decision
            } else {
                if (num_divs === 1) {
                    return false; // nothing to synchronize
                }
                else {
                    return true; // default: keep in sync
                }
            }
        };

        viewer.addHandler('open', (param) => {
            let dimWidthEl = document.getElementById("dim-w");
            let dimHeightEl = document.getElementById("dim-h");
            let tiledImage = viewer.world.getItemAt(0);
            let imgRect = tiledImage.getBounds(true);
            let elementRect = viewer.viewport.viewportToViewerElementRectangle(
                imgRect
            );
            dimWidthEl.value = elementRect.width;
            dimHeightEl.value = elementRect.height;

        })

        /**
         * @param imageArray
         * @param opacityArray
         */
        this.setSources = function (imageArray, opacityArray) {

            imageArray.forEach(function (image, index) {
                // add images to viewer
                viewer.addTiledImage({ tileSource: image, opacity: opacityArray ? opacityArray[index] : 0, x: 0, y: 0 });
            });

            viewer.world.addHandler("add-item", (event) => {

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

        /**
         * INITIALIZE
         */
        function setViewer(viewerDivId) {
            // console.log(viewerDivId);

            viewer = OpenSeadragon({
                id: viewerDivId,
                prefixUrl: "./js/lib/openseadragon/images/",
                showFullPageControl: options.viewerOpts.showFullPageControl,
                showHomeControl: options.viewerOpts.showHomeControl,
                showZoomControl: options.viewerOpts.showZoomControl,
                crossOriginPolicy: 'Anonymous'
            });

            // Markup tools event listeners
            if (options.toolbarOn) {
                markupTools(idx, viewer);
            }

            // Sliders event listeners
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

            // Filtering
            if (options.filterOn) {

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

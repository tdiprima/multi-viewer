/**
 * Wrapper object for the osd viewers
 */
class nViewer {
    constructor(viewerDivId, sliderElements, options) {

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
                // If 1 div; then, nothing to synchronize.
                return num_divs !== 1;
            }
        };

        this.getChkZoom = function () {
            if (typeof chkZoom.checked !== 'undefined') {
                return chkZoom.checked; // user decision
            } else {
                return num_divs !== 1;
            }
        };

        // The url will return an image for the region specified by the given x, y, and level.
        function getTileSourceUrl(source, level, x, y) {
            let IIIF_ROTATION = '0';
            let scale = Math.pow(0.5, source.maxLevel - level);
            let levelWidth = Math.ceil(source.width * scale);
            let levelHeight = Math.ceil(source.height * scale), tileSize;

            let iiifTileSize, iiifTileSizeWidth, iiifTileSizeHeight, iiifRegion, iiifTileX, iiifTileY, iiifTileW, iiifTileH, iiifSize, iiifQuality, uri;
            tileSize = source.getTileWidth(level);
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
                iiifTileW = Math.min(iiifTileSizeWidth, source.width - iiifTileX);
                iiifTileH = Math.min(iiifTileSizeHeight, source.height - iiifTileY);
                iiifSize = Math.ceil(iiifTileW * scale) + ",";
                iiifRegion = [iiifTileX, iiifTileY, iiifTileW, iiifTileH].join(',');
            }

            uri = [source['@id'], iiifRegion, iiifSize, IIIF_ROTATION, iiifQuality].join('/');
            // console.log('URI', uri);
            return uri;

        }

        /**
         * @param imageArray
         * @param opacityArray
         */
        this.setSources = function (imageArray, opacityArray) {

            imageArray.forEach(function (image, index) {
                // console.log(image)
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
                        return getTileSourceUrl(this, level, x, y);
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
                console.log('sliderElements', sliderElements)

                for (let i = 0; i < sliderElements.length; i++) {

                    sliderElements[i].addEventListener("input", function () {
                        if (viewer.world.getItemAt(i) !== undefined) {
                            viewer.world.getItemAt(i).setOpacity(sliderElements[i].value / 100);
                        } else {
                            sliderElements[i].hidden = true;
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

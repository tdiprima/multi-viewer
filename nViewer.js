/**
 * @param divId
 * @param cssName
 * @constructor
 */
class nViewer {
  constructor(divId, cssName) {
    let myFilter = {};
    let sliders = [];
    let locker;
    let locked = false;
    let viewer = {};
    const maindiv = document.getElementById('viewers');
    setFilter();
    // setSliders(); <- we do this later
    setViewer();

    this.getViewer = function () {
      return viewer;
    };

    this.getLocked = function () {
      return locked;
    }

    this.setLocked = function (bool) {
      locked = bool;
    }

    /**
     * @param imageArray
     * @param opacityArray
     * @returns nViewer
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
      return viewer;
    };

    function setSliders(div) {
      let d = document.createDocumentFragment();
      let dd = document.createElement('div');

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
        dd.appendChild(range); // append range to div
        d.appendChild(dd); // append div to fragment
        div.appendChild(d); // append fragment to parent
        sliders.push(range);
      }
    }

    function setLock(div) {
      locker = document.createElement('i');
      locker.id = divId.replace("viewer", "lock")
      locker.style.color = 'purple';
      locker.classList.add("fa");
      locker.classList.add("fa-unlock");
      div.appendChild(locker);
    }

    /**
     * INITIALIZE
     */
    function setViewer() {
      let div = document.createElement('div');
      div.id = divId;
      div.setAttribute('class', cssName);
      maindiv.appendChild(div);
      setSliders(div);
      setLock(div);

      // document.body.appendChild(div);
      viewer = OpenSeadragon({
        id: divId,
        prefixUrl: "//openseadragon.github.io/openseadragon/images/",
        showNavigationControl: false,
        crossOriginPolicy: 'Anonymous'
      });
      // viewer.setControlsEnabled(false)

      // SLIDER EVENT LISTENER
      for (let i = 0; i < sliders.length; i++) {
        sliders[i].addEventListener("input", function () {
          if (viewer.world.getItemAt(i) !== undefined) {
            viewer.world.getItemAt(i).setOpacity(sliders[i].value / 100);
          } else {
            sliders[i].hidden = true;
          }
        });
      }

      // LOCKER EVENT LISTENER
      locker.addEventListener('click', function (e) {
        let lockId = this.id;
        let idx = parseInt(lockId.replace("lock", ""));
        if (this.classList.contains("fa-unlock")) {
          // It's unlocked, we're gonna lock it
          sync.setLocked(idx, true);
          viewer.locked = true;
          this.classList.add("fa-lock");
          this.classList.remove("fa-unlock");
          viewer.gestureSettingsMouse.clickToZoom = false;
          viewer.addViewerInputHook({
            hooks: [
              // Disable zoom on mouse wheel and/or pinch zoom
              { tracker: 'viewer', handler: 'scrollHandler', hookHandler: function (event) { event.preventDefaultAction = true; } }
            ]
          });
        } else {
          if (this.classList.contains("fa-lock")) {
            // It's locked, we're gonna unlock it
            sync.setLocked(idx, false);
            viewer.locked = false;
            this.classList.add("fa-unlock");
            this.classList.remove("fa-lock");
            viewer.gestureSettingsMouse.clickToZoom = true;
            viewer.addViewerInputHook({
              hooks: [
                // Enable zoom on mouse wheel and/or pinch zoom
                { tracker: 'viewer', handler: 'scrollHandler', hookHandler: function (event) { event.preventDefaultAction = false; } }
              ]
            });
          }
        }
      });

      viewer.setFilterOptions({
        filters: [{
          items: viewer.world.getItemAt(1),
          processors: [
            myFilter.prototype.COLORIZE(0, 255, 0)
          ]
        }]
      });
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

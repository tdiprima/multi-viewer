/**
 * @param divId
 * @param cssName
 * @constructor
 */
class nViewer {
  constructor(divId, cssName) {
    let idx = divId.replace("viewer", "");
    let myFilter = {};
    let sliders = [];

    // let locker = {};
    // let locked = false;

    let chkPan = {};
    let chkZoom = {};
    // let chkCenter = {};

    let viewer = {};
    const maindiv = document.getElementById('viewers');
    setFilter();
    setViewer();

    this.getViewer = function () {
      return viewer;
    };

    // this.getLocked = function () {
    //   return locked;
    // }
    // function setLocked(bool) {
    //   locked = bool;
    // }

    this.getChkPan = function () {
      return chkPan.checked;
    };

    this.getChkZoom = function () {
      return chkZoom.checked;
    };

    // this.getChkCenter = function () {
    //   return chkCenter.checked;
    // }

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

    /**
     * Match pan, match zoom, match center point
     */
    function setCheckboxes(div) {

      // Create.
      // let style = "margin-right: 10px;";
      // let a = new Lock("i", "lock" + idx, "fa fa-unlock", style)

      let chkPan1 = new Toggle("checkbox", "chkPan" + idx, "Match Pan");
      let chkZoom1 = new Toggle("checkbox", "chkZoom" + idx, "Match Zoom");
      // let chkCenter1 = new Toggle("checkbox", "chkCenter" + idx, "Match Center");

      // Draw.
      let div1 = document.createElement('div');
      let cogHtml = "<div id=\"cog\"><i class=\"fa fa-cog\"></i><div id=\"popup\">&nbsp;menu&nbsp;</div></div>";
      div1.innerHTML = /*a.show()+*/ chkPan1.show() + chkZoom1.show() + cogHtml /*+chkCenter1.show();*/
      div.appendChild(div1);

      // Set. (class variables)
      // locker = document.getElementById("lock" + idx);
      chkPan = document.getElementById("chkPan" + idx)
      chkZoom = document.getElementById("chkZoom" + idx)
      // chkCenter = document.getElementById("chkCenter" + idx)

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
      setCheckboxes(div);

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

      /*
      // "LOCK" EVENT LISTENER
      locker.addEventListener('click', function (e) {
        if (this.classList.contains("fa-unlock")) {
          // It's unlocked, we're gonna lock it
          setLocked(true);
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
            setLocked(false);
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
      });*/

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

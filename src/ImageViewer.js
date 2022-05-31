/**
 * Wrapper component around OpenSeadragon viewer
 * Set up 1 basic OSD viewer.
 * @param viewerInfo: object with info specific to 'this' viewer
 */
class ImageViewer {
  constructor(viewerInfo) {
    const layers = viewerInfo.layers;

    // Array of tileSources for the viewer
    const tileSources = [];
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      tileSources.push({ tileSource: layer.location, opacity: layer.opacity, x: 0, y: 0 });
    }
    // console.log('tileSources', JSON.stringify(ts))

    // SET UP VIEWER
    let viewer;
    try {
      viewer = OpenSeadragon({
        id: viewerInfo.osdId,
        crossOriginPolicy: 'Anonymous',
        blendTime: 0,
        prefixUrl: CONFIG.osdImages,
        minZoomImageRatio: 1,
        maxZoomPixelRatio: 1, // when the user zooms all the way in they are at 100%
        tileSources,
      });
    } catch (e) {
      console.error(e.message);
    }

    let vpt;
    let drawer;

    function addInfo(item) {
      try {
        const itemIndex = viewer.world.getIndexOfItem(item);
        const source = viewer.world.getItemAt(itemIndex).source;

        if (typeof source.prefLabel !== 'undefined') layers[itemIndex].prefLabel = source.prefLabel;
        if (typeof source.resolutionUnit !== 'undefined') layers[itemIndex].resolutionUnit = source.resolutionUnit;
        if (typeof source.xResolution !== 'undefined') layers[itemIndex].xResolution = source.xResolution;
      } catch (e) {
        console.log(`%c${e.message}`, 'color: #ff6a5a;');
      }
    }

    // When an item is added to the World, grab the info
    viewer.world.addHandler('add-item', ({ item }) => {
      addInfo(item);
    });

    // Image has been downloaded and can be modified before being drawn to the canvas.
    viewer.addOnceHandler('tile-loaded', () => {
      drawer = viewer.drawer;
      drawer.imageSmoothingEnabled = false;
      drawer._imageSmoothingEnabled = false;
      // console.log('drawer', drawer)
      vpt = viewer.viewport;

      if (window.location.hash) {
        const params = parseHash();
        useParams(params);
      }
      addCustomButtons();
      setFilter(layers, viewer);
      getInfoForScalebar();
    });

    // ZOOM TO MAGNIFICATION - 10x, 20x, etc.
    const element = document.querySelector('.mag-content');
    for (const el of element.children) {
      el.addEventListener('click', () => {
        const attr = el.getAttribute('data-value');
        const imageZoom = parseFloat(attr);
        vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(imageZoom));
      });
    }

    // BOOKMARK URL with ZOOM and X,Y
    document.getElementById(`btnShare${viewerInfo.idx}`).addEventListener('click', () => {
      const zoom = vpt.getZoom();
      const pan = vpt.getCenter();
      const url = `${location.origin}${location.pathname}#zoom=${zoom}&x=${pan.x}&y=${pan.y}`;
      const I = viewer.world.getItemAt(0);
      // console.log('image coords', I.viewportToImageCoordinates(pan));
      // console.log('url', url);

      prompt('Share this link:', url);
    });

    // DOWNLOAD IMAGE SNAPSHOT
    document.getElementById(`btnCam${viewerInfo.idx}`).addEventListener('click', () => {
      const parent = document.getElementById(viewerInfo.osdId);
      const children = parent.querySelectorAll('[id^="osd-overlaycanvas"]');

      for (const canvasEl of children) {
        const id = canvasEl.id;
        const num = parseInt(id.slice(-1));
        if (num % 2 === 0) {
          const ctx = viewer.drawer.context;
          ctx.drawImage(canvasEl, 0, 0);
          const osdImg = viewer.drawer.canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = osdImg;
          downloadLink.download = `img_${timeStamp()}`;
          downloadLink.click();
          break;
        }
      }
    });

    function useParams(params) {
      const zoom = vpt.getZoom();
      const pan = vpt.getCenter();

      // In Chrome, these fire when you pan/zoom AND tab-switch to something else (like your IDE)
      if (params.zoom !== undefined && params.zoom !== zoom) {
        vpt.zoomTo(params.zoom, null, true);
      }

      if (
        params.x !== undefined
        && params.y !== undefined
        && (params.x !== pan.x || params.y !== pan.y)
      ) {
        const point = new OpenSeadragon.Point(params.x, params.y);
        vpt.panTo(point, true);
      }
    }

    // CUSTOM OPENSEADRAGON BUTTONS
    function addCustomButtons() {
      // Zoom all the way in
      const zinButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 100%',
        srcRest: `${CONFIG.osdImages}zin_rest.png`,
        srcGroup: `${CONFIG.osdImages}zin_grouphover.png`,
        srcHover: `${CONFIG.osdImages}zin_hover.png`,
        srcDown: `${CONFIG.osdImages}zin_pressed.png`,
        onClick() {
          viewer.viewport.zoomTo(viewer.viewport.getMaxZoom());
          // vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(1.0));
        }
      });

      // Zoom all the way out
      const zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: `${CONFIG.osdImages}zout_rest.png`,
        srcGroup: `${CONFIG.osdImages}zout_grouphover.png`,
        srcHover: `${CONFIG.osdImages}zout_hover.png`,
        srcDown: `${CONFIG.osdImages}zout_pressed.png`,
        onClick() {
          vpt.goHome(true);
          // viewer.viewport.zoomTo(viewer.viewport.getHomeZoom());
        }
      });
      viewer.addControl(zinButton.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
      viewer.addControl(zoutButton.element, { anchor: OpenSeadragon.ControlAnchor.TOP_LEFT });
    }

    // SET UP SCALE BAR
    const setScaleBar = ppm => {
      viewer.scalebar({
        type: OpenSeadragon.ScalebarType.MICROSCOPY,
        pixelsPerMeter: ppm,
        location: OpenSeadragon.ScalebarLocation.BOTTOM_LEFT,
        xOffset: 5,
        yOffset: 10,
        stayInsideImage: true,
        color: 'rgb(150, 150, 150)',
        fontColor: 'rgb(100, 100, 100)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        barThickness: 2
      });
    };

    function getInfoForScalebar() {
      // Get info for scale bar
      const item = layers[0];
      // plugin assumes that the provided pixelsPerMeter is the one of the image at index 0 in world.getItemAt
      if (isRealValue(item.resolutionUnit)) {
        if (item.resolutionUnit === 3) {
          const pixPerCm = item.xResolution;
          setScaleBar(pixPerCm * 100);
          MICRONS_PER_PIX = 10000 / pixPerCm;
        } else {
          console.warn('resolutionUnit <> 3', item.resolutionUnit);
        }
      }
    }

    this.viewer = viewer; // SET THIS VIEWER
    this.overlay = this.viewer.fabricjsOverlay({ scale: 1000 });
    this.canvas = this.overlay.fabricCanvas();
    this.vInfo = viewerInfo;
  }

  getViewer() {
    return this.viewer;
  }

  getOverlay() {
    return this.overlay;
  }

  getCanvas() {
    return this.canvas;
  }

  getViewerInfo() {
    return this.vInfo;
  }
}

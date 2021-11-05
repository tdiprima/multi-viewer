/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 * @param viewerInfo
 * @param itemsToBeDisplayed
 */
class ImageViewer {
  constructor(viewerInfo, itemsToBeDisplayed) {
    let tileSources = []
    for (let i = 0; i < itemsToBeDisplayed.length; i++) {
      let u = itemsToBeDisplayed[i].location
      /*
      if (i > 0) {
        // Temporarily mutate the url string
        // Test, test, and again test.
        // u += "&foo=bar"
        u = u.replace('halcyon/?iiif', 'halcyon/?foo=bar&iiif')
        // u += "?foo=bar"
        // u = u.replace('halcyon/?iiif', 'halcyon/?renderType=byProbability&iiif')
        // u += '&renderType=byProbability';
        itemsToBeDisplayed[i].location = u;
      }
      console.log(u)
       */
      tileSources.push({
        tileSource: u,
        opacity: itemsToBeDisplayed[i].opacity,
        x: 0,
        y: 0
      })
    }

    // SET UP VIEWER
    let viewer = OpenSeadragon({
      id: viewerInfo.divId,
      crossOriginPolicy: 'Anonymous',
      blendTime: 0,
      prefixUrl: config.osdImages,
      tileSources: tileSources,
      maxZoomPixelRatio: 1
    })

    const vpt = viewer.viewport

    viewer.world.addHandler('add-item', ({item}) => {
      try {
        const itemIndex = viewer.world.getIndexOfItem(item)
        const source = viewer.world.getItemAt(itemIndex).source
        // ADD INFO TO OUR ITEMS
        itemsToBeDisplayed[itemIndex].prefLabel = source.prefLabel
        itemsToBeDisplayed[itemIndex].resolutionUnit = source.resolutionUnit
        itemsToBeDisplayed[itemIndex].xResolution = source.xResolution
      } catch (e) {
        console.log(`%c${e.message}`, 'color: #ff6a5a;')
      }
    })

    // ZOOM TO MAGNIFICATION - 10x, 20x, etc.
    let element = document.querySelector('.mag-content')
    for (let i = 0; i < element.children.length; i++) {
      let el = element.children[i]
      el.addEventListener('click', function () {
        let attr = el.getAttribute('data-value')
        let imageZoom = parseFloat(attr)
        vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(imageZoom))
      })
    }

    // BOOKMARK URL with ZOOM and X,Y
    document.getElementById(`btnShare${viewerInfo.idx}`).addEventListener('click', function () {
      let oldUrl = location.href
      let zoom = vpt.getZoom()
      let pan = vpt.getCenter()
      let url = `${location.origin}${location.pathname}#zoom=${zoom}&x=${pan.x}&y=${pan.y}`
      // console.log(oldUrl, url)
      prompt('Share this link:', url)
    })

    // DOWNLOAD IMAGE SNAPSHOT
    document.getElementById(`btnCam${viewerInfo.idx}`).addEventListener('click', function () {
      let parent = document.getElementById(viewerInfo.divId)
      let children = parent.querySelectorAll('[id^="osd-overlaycanvas"]')
      for (let i = 0; i < children.length; i++) {
        let canvasEl = children[i]
        let id = canvasEl.id
        let num = parseInt(id.slice(-1))
        if (num % 2 === 0) {
          let ctx = viewer.drawer.context
          ctx.drawImage(canvasEl, 0, 0)
          let osdImg = viewer.drawer.canvas.toDataURL('image/png')
          let downloadLink = document.createElement('a')
          downloadLink.href = osdImg
          downloadLink.download = `img_${timeStamp()}`
          downloadLink.click()
          break
        }
      }
    })

    function useParams(params) {
      let zoom = vpt.getZoom()
      let pan = vpt.getCenter()

      // In Chrome, these fire when you pan/zoom AND tab-switch to something else (like your IDE)
      if (params.zoom !== undefined && params.zoom !== zoom) {
        vpt.zoomTo(params.zoom, null, true)
      }

      if (params.x !== undefined && params.y !== undefined && (params.x !== pan.x || params.y !== pan.y)) {
        let point = new OpenSeadragon.Point(params.x, params.y)
        vpt.panTo(point, true)
      }
    }

    // DO ONCE
    viewer.addOnceHandler('tile-loaded', function () {
      if (window.location.hash) {
        let params = parseHash()
        useParams(params)
      }
      addCustomButtons()
      setFilter(itemsToBeDisplayed, viewer)
      getInfoForScalebar()
    })

    // CUSTOM OPENSEADRAGON BUTTONS
    function addCustomButtons() {

      let zinButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 100%',
        srcRest:  `${config.osdImages}zin_rest.png`,
        srcGroup: `${config.osdImages}zin_grouphover.png`,
        srcHover: `${config.osdImages}zin_hover.png`,
        srcDown: `${config.osdImages}zin_pressed.png`,
        onClick: function () {
          vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(1.0))
        }
      })
      let zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: `${config.osdImages}zout_rest.png`,
        srcGroup: `${config.osdImages}zout_grouphover.png`,
        srcHover: `${config.osdImages}zout_hover.png`,
        srcDown: `${config.osdImages}zout_pressed.png`,
        onClick: function () {
          vpt.goHome(true)
        }
      })
      viewer.addControl(zinButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT})
      viewer.addControl(zoutButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT})
    }

    // SET UP SCALE BAR
    let setScaleBar = function (ppm) {
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
      })
    }

    function getInfoForScalebar() {
      // Get info for scale bar
      let item = itemsToBeDisplayed[0]
      // plugin assumes that the provided pixelsPerMeter is the one of the image at index 0 in world.getItemAt
      if (isRealValue(item.resolutionUnit)) {
        if (item.resolutionUnit === 3) {
          let pix_per_cm = item.xResolution
          setScaleBar(pix_per_cm * 100)
          pix_per_micron = pix_per_cm / 10000 // 1 cm = 10000 µ
          microns_per_pix = 10000 / pix_per_cm
        } else {
          console.warn('resolutionUnit <> 3', item.resolutionUnit)
        }
      }
    }

    this.viewer = viewer // SET THIS VIEWER
    this.overlay = this.viewer.fabricjsOverlay({scale: 1000})
    this.canvas = this.overlay.fabricCanvas()
  }

  getViewer() {
    return this.viewer
  }

  getOverlay() {
    return this.overlay
  }

  getCanvas() {
    return this.canvas
  }
}

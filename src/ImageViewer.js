/**
 * Wrapper component around OpenSeadragon viewer
 * Set up 1 basic OSD viewer.
 * @param viewerInfo: object with info specific to 'this' viewer
 * @param layers: array of layer objects (1 image per layer)
 */
class ImageViewer {
  constructor(viewerInfo, layers) {
    let ts = []

    for (let ll of layers) {
      ts.push({
        tileSource: ll.location,
        opacity: ll.opacity,
        x: 0,
        y: 0
      })
    }

    // SET UP VIEWER
    let viewer
    try {
      viewer = OpenSeadragon({
        id: viewerInfo.divId,
        crossOriginPolicy: 'Anonymous',
        blendTime: 0,
        prefixUrl: CONFIG.osdImages,
        tileSources: ts,
        maxZoomPixelRatio: 1
        // showNavigationControl: false,
        // showNavigator: true,
        // navigatorPosition: "BOTTOM_RIGHT",
      })
    } catch (e) {
      console.error(e.message)
    }

    const vpt = viewer.viewport

    function addInfo(item) {
      try {
        const itemIndex = viewer.world.getIndexOfItem(item)
        const source = viewer.world.getItemAt(itemIndex).source
        layers[itemIndex].prefLabel = source.prefLabel
        layers[itemIndex].resolutionUnit = source.resolutionUnit
        layers[itemIndex].xResolution = source.xResolution
      } catch (e) {
        console.log(`%c${e.message}`, 'color: #ff6a5a;')
      }
    }

    // When an item is added to the World, grab the info
    viewer.world.addHandler('add-item', ({item}) => {
      addInfo(item)
    })

    // ZOOM TO MAGNIFICATION - 10x, 20x, etc.
    let element = document.querySelector('.mag-content')

    for (let el of element.children) {
      el.addEventListener('click', () => {
        let attr = el.getAttribute('data-value')
        let imageZoom = parseFloat(attr)
        vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(imageZoom))
      })
    }

    // BOOKMARK URL with ZOOM and X,Y
    document.getElementById(`btnShare${viewerInfo.idx}`).addEventListener('click', () => {
      let zoom = vpt.getZoom()
      let pan = vpt.getCenter()
      let url = `${location.origin}${location.pathname}#zoom=${zoom}&x=${pan.x}&y=${pan.y}`
      let I = viewer.world.getItemAt(0)
      console.log('image coords', I.viewportToImageCoordinates(pan))
      console.log('url', url)

      prompt('Share this link:', url)
    })

    // DOWNLOAD IMAGE SNAPSHOT
    document.getElementById(`btnCam${viewerInfo.idx}`).addEventListener('click', () => {
      let parent = document.getElementById(viewerInfo.divId)
      let children = parent.querySelectorAll('[id^="osd-overlaycanvas"]')

      for (let canvasEl of children) {
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

    // Image has been downloaded and can be modified before being drawn to the canvas.
    viewer.addOnceHandler('tile-loaded', () => {
      if (window.location.hash) {
        let params = parseHash()
        useParams(params)
      }
      addCustomButtons()
      setFilter(layers, viewer)
      getInfoForScalebar()
    })

    // CUSTOM OPENSEADRAGON BUTTONS
    function addCustomButtons() {
      // Zoom all the way in
      let zinButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 100%',
        srcRest: `${CONFIG.osdImages}zin_rest.png`,
        srcGroup: `${CONFIG.osdImages}zin_grouphover.png`,
        srcHover: `${CONFIG.osdImages}zin_hover.png`,
        srcDown: `${CONFIG.osdImages}zin_pressed.png`,
        onClick() {
          vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(1.0))
        }
      })

      // Zoom all the way out
      let zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: `${CONFIG.osdImages}zout_rest.png`,
        srcGroup: `${CONFIG.osdImages}zout_grouphover.png`,
        srcHover: `${CONFIG.osdImages}zout_hover.png`,
        srcDown: `${CONFIG.osdImages}zout_pressed.png`,
        onClick() {
          vpt.goHome(true)
        }
      })
      viewer.addControl(zinButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT})
      viewer.addControl(zoutButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT})
    }

    // SET UP SCALE BAR
    let setScaleBar = ppm => {
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
      let item = layers[0]
      // plugin assumes that the provided pixelsPerMeter is the one of the image at index 0 in world.getItemAt
      if (isRealValue(item.resolutionUnit)) {
        if (item.resolutionUnit === 3) {
          const pixPerCm = item.xResolution
          setScaleBar(pixPerCm * 100)
          MICRONS_PER_PIX = 10000 / pixPerCm
        } else {
          console.warn('resolutionUnit <> 3', item.resolutionUnit)
        }
      }
    }

    let canvas = viewer.fabricjsOverlay({scale: 1000}).fabricCanvas()
    canvas.on('after:render', function () {
      canvas.calcOffset()
    })

    function displayCrosshairs(display) {
      if (!display) {
        let cross = canvas.getActiveObject()
        canvas.remove(cross)
      } else {
        fabric.Image.fromURL('/images/crosshairs-red.png', function (oImg) {
          canvas.add(oImg.set({
            width: 50,
            hasControls: false,
            selection: false,
            lockRotation: false,
            hoverCursor: 'default',
            hasRotatingPoint: false,
            hasBorders: false,
            height: 50,
            angle: 0,
            cornerSize: 10,
            left: 0,
            top: 0
          }))

          // Set the object to be centered to the Canvas
          canvas.centerObject(oImg)
          canvas.setActiveObject(oImg)
          canvas.renderAll()
          oImg.setCoords()
        })
      }
    }

    let btnCrosshairs = document.getElementById(`btnCrosshairs${viewerInfo.idx}`)
    btnCrosshairs.addEventListener('click', () => {
      if (btnCrosshairs.classList.contains('btnOn')) {
        displayCrosshairs(false)
      } else {
        displayCrosshairs(true)
      }
      toggleButton(btnCrosshairs, 'btnOn', 'btn')
    })

    // Uncomment for testing:
    // viewer.addHandler('canvas-click', event => {
    //   const webPoint = event.position
    //   const viewportPoint = vpt.pointFromPixel(webPoint)
    //   const I = viewer.world.getItemAt(0)
    //   const imagePoint = I.viewportToImageCoordinates(viewportPoint)
    //   console.log('webPoint', Math.round(webPoint.x), Math.round(webPoint.y))
    //   console.log('imagePoint', Math.round(imagePoint.x), Math.round(imagePoint.y))
    // })

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

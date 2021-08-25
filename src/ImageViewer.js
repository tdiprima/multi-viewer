/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 * @param viewerInfo
 * @param itemsToBeDisplayed
 */
class ImageViewer {
  constructor(viewerInfo, itemsToBeDisplayed) {
    // SET UP VIEWER
    let viewer = OpenSeadragon({
      id: viewerInfo.divId,
      crossOriginPolicy: 'Anonymous',
      prefixUrl: '/multi-viewer/vendor/openseadragon/images/' /* WICKET ENVI */
    })
    let overlay = {}
    let canvas = {}

    // LOAD IMAGES INTO THE VIEWER
    for (let i = 0; i < itemsToBeDisplayed.length; i++) {
      viewer.addTiledImage({
        tileSource: itemsToBeDisplayed[i].location,
        opacity: itemsToBeDisplayed[i].opacity,
        x: 0,
        y: 0
      })
    }
    const vpt = viewer.viewport

    let element = document.querySelector('.mag-content')
    for (let i = 0; i < element.children.length; i++) {
      let el = element.children[i]
      el.addEventListener('click', function () {
        let attr = el.getAttribute('data-value')
        let imageZoom = parseFloat(attr)
        vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(imageZoom))
      })
    }

    viewer.world.addHandler('add-item', ({item}) => {
      const itemIndex = viewer.world.getIndexOfItem(item)
      let source = viewer.world.getItemAt(itemIndex).source
      if (itemIndex > 0) {
        // CONFIGURE OUR CUSTOM TILE SOURCES
        source.getTileUrl = function (level, x, y) {
          return getIIIFTileUrl(this, level, x, y)
        }
        // ADD INFO TO OUR ITEMS
        itemsToBeDisplayed[itemIndex].prefLabel = source.prefLabel // set prefLabel
      } else {
        itemsToBeDisplayed[itemIndex].prefLabel = source.prefLabel
        itemsToBeDisplayed[itemIndex].resolutionUnit = source.resolutionUnit
        itemsToBeDisplayed[itemIndex].xResolution = source.xResolution
      }
    })

    document.getElementById(`btnShare${viewerInfo.idx}`).addEventListener('click', function () {
      let oldUrl = location.href
      let zoom = viewer.viewport.getZoom()
      let pan = viewer.viewport.getCenter()
      let url = location.origin + location.pathname + '#zoom=' + zoom + '&x=' + pan.x + '&y=' + pan.y
      console.log(oldUrl, url)
      prompt('Share this link:', url)
    })

    document.getElementById(`btnCam${viewerInfo.idx}`).addEventListener('click', function () {
      let img = viewer.drawer.canvas.toDataURL("image/png");
      let downloadlink = document.createElement('a')
      downloadlink.href = img
      downloadlink.download = `img_${timeStamp()}`
      downloadlink.click()
    })

    function getIIIFTileUrl(source, level, x, y) {
      const scale = Math.pow(0.5, source.maxLevel - level)
      const levelWidth = Math.ceil(source.width * scale)
      const levelHeight = Math.ceil(source.height * scale)

      const tileSize = source.getTileWidth(level) // width == height
      let tileSizeWidth
      const tileSizeHeight = tileSizeWidth = Math.ceil(tileSize / scale)

      const ROTATION = '0'
      const quality = 'default.png'

      let region, tileX, tileY, tileW, tileH, size

      if (levelWidth < tileSize && levelHeight < tileSize) {
        size = levelWidth + ','
        region = 'full'
      } else {
        tileX = x * tileSizeWidth
        tileY = y * tileSizeHeight
        tileW = Math.min(tileSizeWidth, source.width - tileX)
        tileH = Math.min(tileSizeHeight, source.height - tileY)
        size = Math.ceil(tileW * scale) + ','
        region = [tileX, tileY, tileW, tileH].join(',')
      }
      return [source['@id'], region, size, ROTATION, quality].join('/')
    }

    function useParams(params) {
      let zoom = viewer.viewport.getZoom()
      let pan = viewer.viewport.getCenter()

      // In Chrome, these fire when you pan/zoom AND tab-switch to something else (like HERE)
      if (params.zoom !== undefined && params.zoom !== zoom) {
        viewer.viewport.zoomTo(params.zoom, null, true)
      }

      if (params.x !== undefined && params.y !== undefined && (params.x !== pan.x || params.y !== pan.y)) {
        let point = new OpenSeadragon.Point(params.x, params.y)
        viewer.viewport.panTo(point, true)
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

    function addCustomButtons() {
      let dir = '/multi-viewer/vendor/openseadragon/images/' /* WICKET ENVI */
      let zinButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 100%',
        srcRest: dir + 'zin_rest.png',
        srcGroup: dir + 'zin_grouphover.png',
        srcHover: dir + 'zin_hover.png',
        srcDown: dir + 'zin_pressed.png',
        onClick: function () {
          vpt.zoomTo(viewer.world.getItemAt(0).imageToViewportZoom(1.0))
        }
      })
      let zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: dir + 'zout_rest.png',
        srcGroup: dir + 'zout_grouphover.png',
        srcHover: dir + 'zout_hover.png',
        srcDown: dir + 'zout_pressed.png',
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
        color: "rgb(150, 150, 150)",
        fontColor: "rgb(100, 100, 100)",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        barThickness: 2
      })
    }

    function getInfoForScalebar() {
      // Get info for scalebar
      let item = itemsToBeDisplayed[0]
      // plugin assumes that the provided pixelsPerMeter is the one of the image at index 0 in world.getItemAt
      if (item.resolutionUnit === 3) {
        let pix_per_cm = item.xResolution
        setScaleBar(pix_per_cm * 100)
        pix_per_micron = pix_per_cm / 10000 // 1 cm = 10000 µ
        microns_per_pix = 10000 / pix_per_cm
      } else {
        console.warn('Handle resolution unit', item.resolutionUnit)
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

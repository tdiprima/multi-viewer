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
      prefixUrl: '/multi-viewer/vendor/openseadragon/images/', /* WICKET ENVI */
      crossOriginPolicy: 'Anonymous',
      immediateRender: true,
      animationTime: 0,
      imageLoaderLimit: 1
    })

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

    // CUSTOM ZOOM BUTTONS
    viewer.addOnceHandler('tile-loaded', function () {
      let dir = '/multi-viewer/vendor/openseadragon/images/' /* WICKET ENVI */
      let zinButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 100%',
        srcRest: dir + 'zin_rest.png',
        srcGroup: dir + 'zin_grouphover.png',
        srcHover: dir + 'zin_hover.png',
        srcDown: dir + 'zin_pressed.png',
        onClick: function () {
          viewer.viewport.zoomTo(viewer.viewport.imageToViewportZoom(1.0))
        }
      })
      let zoutButton = new OpenSeadragon.Button({
        tooltip: 'Zoom to 0%',
        srcRest: dir + 'zout_rest.png',
        srcGroup: dir + 'zout_grouphover.png',
        srcHover: dir + 'zout_hover.png',
        srcDown: dir + 'zout_pressed.png',
        onClick: function () {
          viewer.viewport.goHome(true)
        }
      })
      viewer.addControl(zinButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT})
      viewer.addControl(zoutButton.element, {anchor: OpenSeadragon.ControlAnchor.TOP_LEFT})
    })

    // LOAD IMAGES INTO THE VIEWER
    for (let i = 0; i < itemsToBeDisplayed.length; i++) {
      // console.log('addTiledImage', itemsToBeDisplayed[i].location, 'at', itemsToBeDisplayed[i].opacity)
      viewer.addTiledImage({
        tileSource: itemsToBeDisplayed[i].location,
        opacity: itemsToBeDisplayed[i].opacity,
        x: 0,
        y: 0
      })
    }

    function setFilter() {
      // SET COLOR FILTER
      let itemCount = viewer.world.getItemCount()
      let filterOpts = []
      // Gather what we're doing for each layer
      for (let i = 0; i < itemCount; i++) {
        //if (typeof itemsToBeDisplayed[i].colors !== 'undefined') {
        if (i > 0) { // except the base
          filterOpts.push({
            items: viewer.world.getItemAt(i),
            processors: [
              colorFilter.prototype.COLORLEVELS(itemsToBeDisplayed[i].colors)
            ]
          })
        }
      }
      // Set all layers at once (required)
      viewer.setFilterOptions({
        filters: filterOpts,
        loadMode: 'sync'
      })
    }

    viewer.world.addHandler('add-item', ({item}) => {
      const itemIndex = viewer.world.getIndexOfItem(item)
      let tiledImage = viewer.world.getItemAt(itemIndex)
      let source = tiledImage.source
      if (itemIndex > 0) {
        // CONFIGURE OUR CUSTOM TILE SOURCES
        viewer.world.getItemAt(itemIndex).source.getTileUrl = function (level, x, y) {
          return getIIIFTileUrl(this, level, x, y)
        }
        itemsToBeDisplayed[itemIndex].prefLabel = source.prefLabel
      } else {
        itemsToBeDisplayed[itemIndex].prefLabel = source.prefLabel
        itemsToBeDisplayed[itemIndex].resolutionUnit = source.resolutionUnit
        itemsToBeDisplayed[itemIndex].xResolution = source.xResolution
      }
      // COLOR FILTER
      if (viewer.world.getItemCount() === itemsToBeDisplayed.length) {
        setFilter()
        let item = itemsToBeDisplayed[0]
        // plugin assumes that the provided pixelsPerMeter is the one of the image at index 0 in world.getItemAt
        if (item.resolutionUnit === 3) {
          let pix_per_cm = item.xResolution
          setScaleBar(pix_per_cm * 100)
          pix_per_micron = pix_per_cm / 10000 // 1 cm = 10000 µ
        } else {
          console.warn('Handle resolution unit', item.resolutionUnit)
        }
      }
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

    this.viewer = viewer // SET THIS VIEWER

  }

  getViewer() {
    return this.viewer
  }

}

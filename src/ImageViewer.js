/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 * @param viewerIndex
 * @param viewerDivId - containing div id
 * @param baseImage
 * @param data - features and opacities
 * @param options
 */
class ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, data, options) {
    this.viewer = {}
    let viewer = OpenSeadragon({
      id: viewerDivId,
      prefixUrl: 'vendor/openseadragon/images/',
      crossOriginPolicy: 'Anonymous',
      immediateRender: true,
      animationTime: 0,
      imageLoaderLimit: 1,
      showNavigator: true,
      navigatorPosition: "BOTTOM_RIGHT"
    })

    if (baseImage.includes('info.json')) {
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
          // fontSize: "small",
          barThickness: 2
        })
      }
      // Get info for scale bar
      let promiseA = async function () {
        return (await fetch(baseImage)).json()
      }
      let promiseB = promiseA()
      promiseB.then(function (d) {
        if (d['resolutionUnit'] === 3) {
          setScaleBar(d['xResolution'] * 100)
        } else {
          // let ppm = (1 / (parseFloat('0.25') * 0.000001))
          console.warn('Handle resolution unit', d['resolutionUnit'])
        }
      })
    }

    // CUSTOM ZOOM BUTTONS
    viewer.addOnceHandler('tile-loaded', function () {
      let dir = 'vendor/openseadragon/images/'
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

    // Add BASE image to viewer
    viewer.addTiledImage({tileSource: baseImage, opacity: 1, x: 0, y: 0})

    // Add FEATURE layers to viewer
    const features = data.features
    const opacity = data.opacities
    if (features) {
      features.forEach(function (feature, index) {
        viewer.addTiledImage({tileSource: feature, opacity: opacity[index], x: 0, y: 0})
      })
    }

    // OVERLAY FEATURES
    viewer.world.addHandler('add-item', function (event) {
      const itemIndex = viewer.world.getIndexOfItem(event.item)
      if (itemIndex > 0) {
        setViewerFilter(options.colorRanges, viewer)
        viewer.world.getItemAt(itemIndex).source.getTileUrl = function (level, x, y) {
          return getIIIFTileUrl(this, level, x, y)
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

    this.viewer = viewer

  }

  getViewer() {
    return this.viewer
  }

}

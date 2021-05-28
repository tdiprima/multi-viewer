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
    this.options = options
    this.setSources(viewerIndex, baseImage, data, this.setViewer(viewerDivId), this.options)
  }

  setViewer(viewerDivId) {
    let viewer
    try {
      viewer = OpenSeadragon({
        id: viewerDivId,
        prefixUrl: 'vendor/openseadragon/images/',
        crossOriginPolicy: 'Anonymous',
        immediateRender: true,
        animationTime: 0,
        imageLoaderLimit: 1,
        showNavigator: true,
        navigatorPosition: "BOTTOM_RIGHT"
        // navigatorAutoFade: true,
        // DEBUG TOOLS:
        // debugMode: true,
        // debugGridColor: "#f9276f"
      })
    } catch (e) {
      console.warn('setViewer', e)
      viewer = null
    }

    // TODO: get mpp/ppm dynamically
    // openslide.mpp-x: '0.25'
    let ppm = (1 / (parseFloat('0.25') * 0.000001))
    if (viewer !== null) {
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

    this.viewer = viewer
    return viewer
  }

  getViewer() {
    return this.viewer
  }

  setSources(viewerIndex, baseImage, data, viewer, options) {
    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({ tileSource: baseImage, opacity: 1, x: 0, y: 0 })

      // Add FEATURE layers to viewer
      const features = data.features
      const opacity = data.opacities
      if (features) {
        features.forEach(function (feature, index) {
          viewer.addTiledImage({ tileSource: feature, opacity: opacity[index], x: 0, y: 0 })
        })
      }
      overlayFeatures(viewer, options.colorRanges)
    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
      // Terminate the script.
      window.stop()
      throw new Error("ERROR")
    })

    function overlayFeatures(viewer, colorRanges) {
      try {
        viewer.world.addHandler('add-item', function (event) {
          // console.log(viewer.world.getItemAt(0))
          const itemIndex = viewer.world.getIndexOfItem(event.item)
          if (itemIndex > 0) {
            setViewerFilter(colorRanges, viewer)
            viewer.world.getItemAt(itemIndex).source.getTileUrl = function (level, x, y) {
              return getIIIFTileUrl(this, level, x, y)
            }
          }
        })
      } catch (e) {
        console.error('Here we are', e.message)
      }
    }

    function dataCheck(url, jqXHR) {
      const message = 'ImageViewer.js: Url for the viewer isn\'t good... please check.'
      console.warn(message)
      console.log('jqXHR object:', jqXHR)
      console.log('URL', url)
      document.write(`<h1>${message}</h1><b>URL:</b>&nbsp;${url}<br><br><b>Check the console for any clues.`)
    }

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
  }
}

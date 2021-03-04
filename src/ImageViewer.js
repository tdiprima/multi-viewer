/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param featureLayers
 */
class ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, featureLayers) {
    this.viewer = {}
    this.setViewer(viewerDivId)
    this.setSources(viewerIndex, baseImage, featureLayers, this.viewer)
  }

  setViewer(viewerDivId) {
    try {
      this.viewer = OpenSeadragon({
        id: viewerDivId,
        prefixUrl: 'vendor/openseadragon/images/',
        crossOriginPolicy: 'Anonymous'
      })
    } catch (e) {
      console.log(e)
    }

  }

  getViewer() {
    return this.viewer
  }

  setSources(viewerIndex, baseImage, featureLayers, viewer) {
    let imf = new imageFiltering()
    let filter = imf.getFilter()

    // Quick check url
    $.get(baseImage).done(function () {
      // Add base image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})
      // Add feature images to viewer
      if (arrayCheck(viewerIndex, featureLayers)) {
        // todo: Does the sequence start with zero or 1 (or ...)
        featureLayers[viewerIndex - 1].forEach(function (feature, index) {
          viewer.addTiledImage({tileSource: feature, opacity: 1.0, x: 0, y: 0})
        })
      }
    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
    })

    viewer.world.addHandler('add-item', function (event) {
      let newIndex = viewer.world.getIndexOfItem(event.item)
      if (viewer.world.getItemCount() >= 2) {
        let color = newIndex === 1 ? [0, 255, 0] : imf.getColor(0)
        console.log(newIndex, color)
        viewer.setFilterOptions({
          filters: [{
            items: viewer.world.getItemAt(newIndex),
            processors: [
              filter.prototype.COLORIZE(color.r, color.g, color.b)
            ]
          }]
        })

        viewer.world.getItemAt(newIndex).source.getTileUrl = function (level, x, y) {
          return getIIIFTileUrl(this, level, x, y)
        }
      }
    })

    function dataCheck(url, jqXHR) {
      const message = 'ImageViewer.js: Url for the viewer isn\'t good... please check.'
      console.warn(message)
      console.log('jqXHR object:', jqXHR)
      console.log('URL', url)
      document.write(`<h1>${message}</h1><b>URL:</b>&nbsp;${url}<br><br><b>Check the console for any clues.`)
      throw new Error('Something went wrong.') // Terminates the script.
    }

    function arrayCheck(viewerIndex, featureLayers) {
      // Do we have an array of features?
      if (typeof featureLayers === 'undefined') {
        return false
      }
      if (featureLayers.length === 0) {
        return false
      }
      // Do we have an array of features, for this viewer?
      if (typeof featureLayers[viewerIndex - 1] === 'undefined') {
        return false
      }
      if (featureLayers[viewerIndex - 1].length === 0) {
        return false
      }
      // All checks were successful
      return true
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

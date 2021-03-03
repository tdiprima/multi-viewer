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
    this.filter = {}
    this.setFilter()
    this.setViewer(viewerDivId)
    this.setSources(viewerIndex, baseImage, featureLayers, this.filter, this.viewer)
  }

  setFilter() {
    this.filter = OpenSeadragon.Filters.GREYSCALE
    this.filter.prototype.COLORIZE = function (r, g, b) {
      return function (context, callback) {
        const imgData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
        const pixels = imgData.data
        let i
        for (i = 0; i < pixels.length; i += 4) {
          const avg = pixels[i] / 255
          // If the alpha is set to 255 ("opaque"), the FeatureImage has nuclear material.
          if (pixels[i + 3] === 255) {
            pixels[i] = r * avg
            pixels[i + 1] = g * avg
            pixels[i + 2] = b * avg
            pixels[i + 3] = avg * 255
          } else if (pixels[i] > 0) {
            // If no nuclear material, set to 0 ("transparent").
            pixels[i + 3] = 0
          }
        }
        context.putImageData(imgData, 0, 0)
        callback()
      }
    }
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

  setSources(viewerIndex, baseImage, featureLayers, filter, viewer) {
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
        let color = newIndex === 1 ? [0, 255, 0] : getColor(Math.floor(Math.random() * 14) + 1)
        console.log(newIndex, color)
        viewer.setFilterOptions({
          filters: [{
            items: viewer.world.getItemAt(newIndex),
            processors: [
              filter.prototype.COLORIZE(color[0], color[1], color[2])
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

    function getColor(num) {
      let rtnColor

      switch (num) {
        // case 1: //Base; should not be here.
        case 2:
          // lime
          rtnColor = [0, 255, 0]
          break
        case 3:
          // yellow
          rtnColor = [255, 255, 0]
          break
        case 4:
          // light orange, #fdbf6f
          rtnColor = [253, 191, 111]
          break
        case 5:
          // orange, #ff7f00
          rtnColor = [255, 127, 0]
          break
        case 6:
          // light violet, #cab2d6
          rtnColor = [202, 178, 214]
          break
        case 7:
          // violet, #6a3d9a
          rtnColor = [106, 61, 154]
          break
        case 8:
          // light blue, #a6cee3
          rtnColor = [166, 206, 227]
          break
        case 9:
          // strong blue, #1f78b4
          rtnColor = [31, 120, 180]
          break
        case 10:
          // light green, #b2df8a
          rtnColor = [178, 223, 138]
          break
        case 11:
          // green, #33a02c
          rtnColor = [51, 160, 44]
          break
        case 12:
          // pink, #fb9a99
          rtnColor = [251, 154, 153]
          break
        case 13:
          // light yellow, #ffff99
          rtnColor = [255, 255, 153]
          break;
        case 14:
          // sienna, #b15928
          rtnColor = [177, 89, 40]
          break
        default:
          // lime
          rtnColor = [0, 255, 0]
      }
      return rtnColor

    }
  }
}

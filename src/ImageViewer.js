/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param srcImgPair: Source image pair (array of base image + layer image)
 * @param opacityPair: Opacity for the image pair.
 */
class ImageViewer {
  constructor(viewerDivId, srcImgPair, opacityPair) {
    this.viewer = {}
    this.filter = {}
    this.setFilter()
    this.setViewer(viewerDivId)
    this.setSources(srcImgPair, opacityPair, this.viewer)
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
          if (pixels[i + 3] === 255) {
            pixels[i] = r * avg
            pixels[i + 1] = g * avg
            pixels[i + 2] = b * avg
            pixels[i + 3] = avg * 255
          } else if (pixels[i] > 0) {
            pixels[i + 3] = 0
          }
        }
        context.putImageData(imgData, 0, 0)
        callback()
      }
    }
  }

  setViewer(viewerDivId) {
    this.viewer = OpenSeadragon({
      id: viewerDivId,
      prefixUrl: 'vendor/openseadragon/images/',
      crossOriginPolicy: 'Anonymous'
    })
  }

  getViewer() {
    return this.viewer
  }

  setSources(srcImgPair, opacityPair, viewer) {
    // Quick check url
    $.get(srcImgPair[0]).done(function () {
      srcImgPair.forEach(function (image, index) {
        viewer.addTiledImage({tileSource: image, opacity: opacityPair ? opacityPair[index] : 0, x: 0, y: 0})
      })
    }).fail(function (jqXHR, statusText) {
      const url = srcImgPair[0]
      dataCheck(url, jqXHR, statusText)
    })

    viewer.world.addHandler('add-item', function (event) {
      if (viewer.world.getItemCount() === 2) {
        viewer.setFilterOptions({
          filters: [{
            items: viewer.world.getItemAt(1),
            processors: [
              this.filter.prototype.COLORIZE(0, 255, 0)
            ]
          }]
        })

        viewer.world.getItemAt(1).source.getTileUrl = function (level, x, y) {
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

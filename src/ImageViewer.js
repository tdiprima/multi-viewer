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

    // Quick check url
    $.get(baseImage).done(function () {
      // Add base image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      // Add feature images to viewer
      try {
        featureLayers[viewerIndex - 1].forEach(function (feature) {
          viewer.addTiledImage({tileSource: feature, opacity: 1.0, x: 0, y: 0})
        })
      } catch (error) {
        // console.error(error)
      }


      setTimeout(function () {
        // Give the above a second to kick in
        let imf = new imageFiltering()
        let filter = imf.getFilter()

        // Set filter options
        let itemCount = viewer.world.getItemCount()
        let i
        let filterOpts = []

        for (i = 0; i < itemCount; i++) {
          if (i > 0) {
            filterOpts.push({
              items: viewer.world.getItemAt(i),
              processors: [
                filter.prototype.COLORIZE(imf.getColor(i - 1))
              ]
            })
          }
        }

        viewer.setFilterOptions({
          filters: filterOpts
        })

      }, 1000)

      setTimeout(function () {

        // getTileUrl - layers
        try {
          featureLayers[viewerIndex - 1].forEach(function (feature, index) {
            viewer.world.getItemAt(index + 1).source.getTileUrl = function (level, x, y) {
              return getIIIFTileUrl(this, level, x, y)
            }
          })
        } catch (error) {
          // console.error(error)
        }

      }, 2000)

    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
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

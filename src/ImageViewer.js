/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param featureLayers
 * @param opacity - feature opacity
 */
class ImageViewer {

  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, options) {
    this.viewer = {}
    this.options = options
    this.setSources(viewerIndex, baseImage, featureLayers, opacity, this.setViewer(viewerDivId), this.options)
  }

  setViewer(viewerDivId) {
    let viewer
    try {
      viewer = OpenSeadragon({
        id: viewerDivId,
        prefixUrl: 'vendor/openseadragon/images/',
        crossOriginPolicy: 'Anonymous'
      })
    } catch (e) {
      console.warn('setViewer', e)
      viewer = null
    }
    this.viewer = viewer
    return viewer

  }

  getViewer() {
    return this.viewer
  }

  setSources(viewerIndex, baseImage, allFeatures, allOpacity, viewer, options) {
    let imf = new imageFiltering()
    let idx = viewerIndex - 1  // Array starts with 0; viewer indices start with 1
    let opacity = allOpacity[idx]

    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      // Add FEATURE layers to viewer
      if (arrayCheck(viewerIndex, allFeatures)) {
        allFeatures[idx].forEach(function (feature, index) {
          viewer.addTiledImage({tileSource: feature, opacity: (opacity[index]).toFixed(1), x: 0, y: 0})
        })
      }

      overlayFeatures(viewer, imf, options.colorRanges)

    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
    })

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

    function overlayFeatures(viewer, imf, colorRanges) {

      try {
        viewer.world.addHandler('add-item', function (event) {
          let itemIndex = viewer.world.getIndexOfItem(event.item)
          // let itemCount = viewer.world.getItemCount()
          let filter = fetchFilter(imf, colorRanges)
          if (filter !== null && itemIndex > 0) {
            imf.setLayerNum(itemIndex)
            if (colorRanges.length > 0) {
              viewer.setFilterOptions({
                filters: [{
                  items: viewer.world.getItemAt(itemIndex),
                  processors: [
                    filter.prototype.COLORLEVELS(colorRanges)
                  ]
                }]
              })
            } else {
              // Use COLORIZE
              viewer.setFilterOptions({
                filters: [{
                  items: viewer.world.getItemAt(itemIndex),
                  processors: [
                    filter.prototype.COLORIZE(imf.getColor(itemIndex - 1))
                  ]
                }]
              })
            }
            viewer.world.getItemAt(itemIndex).source.getTileUrl = function (level, x, y) {
              return getIIIFTileUrl(this, level, x, y)
            }
          }

        })
      } catch (e) {
        console.error('Here we are', e.message)
      }

    }

    function fetchFilter(imf, cr) {
      // MAKE DECISION ON TYPE OF FILTER
      let ranges = cr && cr.length > 0
      let filter
      if (ranges) {
        imf.setColorRanges(cr)
        filter = imf.getFilter1()
      } else {
        filter = imf.getFilter()
      }
      return filter
    }

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

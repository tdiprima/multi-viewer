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
    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      // Add FEATURE layers to viewer
      viewerAddFeatures(viewerIndex, allFeatures, allOpacity)

      let features = allFeatures[viewerIndex - 1]
      setTimeout(function () {
        checkWorld(viewer, features, function () {
          overlayFeatures(viewer, features)
        })
      }, 250)

      let cr = options.colorRanges
      setTimeout(function () {
        checkWorld(viewer, features, function () {
          if (cr) {
            setUpFilter(cr, viewer)
          } else {
            console.warn('No options.colorRanges. Skipping...')
          }
        })
      }, 250)

    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
    })

    function checkWorld(viewer, features, callback) {
      console.log(callback)
      // Make sure we have world.getItemAt(...)
      let pos = features.length - 1
      if (viewer.world.getItemAt(pos)) {
        callback()
      }
    }

    function viewerAddFeatures(viewerIndex, allFeatures, allOpacity) {
      let idx = viewerIndex - 1  // Array starts with 0; viewer indices start with 1

      if (typeof allFeatures[idx] === 'undefined') {
        console.log('No features for this viewer', viewerIndex)
      } else {
        let features = allFeatures[idx]
        let opacity
        if (typeof allOpacity[idx] !== 'undefined') {
          opacity = allOpacity[idx]
        } else {
          // Error trapping the case where the number of opacities passed in was wrong.
          let numFeat = allFeatures[idx].length
          let newArray = []
          let j
          for (j = 0; j < numFeat; j++) {
            newArray[j] = 1.0
          }
          opacity = newArray
          console.warn('Setting default opacity for viewer', viewerIndex)
        }

        features.forEach(function (featureUrl, index) {
          viewer.addTiledImage({tileSource: featureUrl, opacity: (opacity[index]).toFixed(1), x: 0, y: 0})
        })

      }
    }

    function overlayFeatures(viewer, features) {
      features.forEach(function (featureUrl, index) {
        try {
          // index + 1 because skipping idx=0 (base image)
          viewer.world.getItemAt(index + 1).source.getTileUrl = function (level, x, y) {
            return getIIIFTileUrl(this, level, x, y)
          }
        } catch (e) {
          console.error(e.message)
          // console.error('undefined: viewer.world.getItemAt', index + 1)
        }
      })
    }

    function fetchFilter(imf, cr) {
      // MAKE DECISION ON TYPE OF FILTER
      let ranges = cr.length > 0
      let filter
      if (ranges) {
        imf.setColorRanges(cr)
        filter = imf.getFilter1()
      } else {
        filter = imf.getFilter()
      }
      return filter
    }

    function setUpFilter(cr, viewer) {
      console.log('HERE!!!')
      let itemCount = viewer.world.getItemCount()
      let filterOpts = []
      let imf = new imageFiltering()
      let filter = fetchFilter(imf, cr)
      if (filter !== null) {
        let i
        for (i = 0; i < itemCount; i++) {
          // Skip base
          if (i > 0) {
            // Use COLORLEVELS if we have it
            if (options.colorRanges.length > 0) {
              filterOpts.push({
                items: viewer.world.getItemAt(i),
                processors: [
                  filter.prototype.COLORLEVELS(options.colorRanges)
                ]
              })
            } else {
              // Use COLORIZE
              filterOpts.push({
                items: viewer.world.getItemAt(i),
                processors: [
                  filter.prototype.COLORIZE(imf.getColor(i - 1)) // each layer different color
                ]
              })
            }
          }
        }

        // setFilterOptions
        viewer.setFilterOptions({
          filters: filterOpts
        })

      }
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

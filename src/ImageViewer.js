/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param featureLayers
 * @param opacity
 */
class ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, opacity) {
    this.viewer = {}
    this.setViewer(viewerDivId)
    this.setSources(viewerIndex, baseImage, featureLayers, opacity, this.viewer)
  }

  setViewer(viewerDivId) {
    try {
      this.viewer = OpenSeadragon({
        id: viewerDivId,
        prefixUrl: 'vendor/openseadragon/images/',
        crossOriginPolicy: 'Anonymous'
      })
    } catch (e) {
      console.warn(e)
    }

  }

  getViewer() {
    return this.viewer
  }

  setSources(viewerIndex, baseImage, featureLayers, opacity, viewer) {

    // Quick check url
    $.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      try {
        // Add FEATURE images to viewer
        if (typeof featureLayers[viewerIndex - 1] === 'undefined') {
          console.log('No features for this viewer', viewerIndex)
        } else {
          let currentViewerFeatures = featureLayers[viewerIndex - 1] // Array starts with 0; viewer indices start with 1
          // console.log('currentViewerFeatures', currentViewerFeatures)

          let currentFeatureOpacity
          if (typeof opacity[viewerIndex - 1] !== 'undefined') {
            currentFeatureOpacity = opacity[viewerIndex - 1]
            // console.log(currentFeatureOpacity)
          } else {
            // Error trapping the case where the number of opacities passed in was wrong.
            let numFeat = featureLayers[viewerIndex - 1].length
            let newArray = []
            let j
            for (j = 0; j < numFeat; j++) {
              newArray[j] = 1.0
            }
            // console.log('newArray', newArray)
            currentFeatureOpacity = newArray
            console.warn('Setting default opacity for viewer', viewerIndex)
          }

          // console.log('opacity', currentFeatureOpacity, 'viewerIndex', viewerIndex)
          currentViewerFeatures.forEach(function (feature, index) {
            viewer.addTiledImage({tileSource: feature, opacity: currentFeatureOpacity[index], x: 0, y: 0})
          })

          try {
            setTimeout(function () {
              let imf = new imageFiltering()
              // console.log('FILTERS')

              // TODO: MAKE DECISION ON TYPE OF FILTER
              // Get JSON - if it's segmentation, use 'filter'
              // If it's anything else (like a heatmap), use 'filter1'

              // Set filter options
              let filter = imf.getFilter1() // TODO: HERE!
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

              // Probability filter
              // let colorRanges = [{ color: 'rgba(216, 63, 42, 255)', low: 201, hi: 255 }, { color: 'rgba(246, 173, 96, 255)', low: 151, hi: 200 },
              //   { color: 'rgba(254, 251, 191, 255)', low: 101, hi: 150 }, { color: 'rgba(171, 221, 164, 255)', low: 51, hi: 100 },
              //   { color: 'rgba(44, 131, 186, 255)', low: 0, hi: 50 }]
              // let filter = imf.getFilter1()
              // viewer.setFilterOptions({
              //   filters: [{
              //     items: viewer.world.getItemAt(1), // TODO: what layer
              //     processors: [
              //       filter.prototype.COLORLEVELS(colorRanges)
              //     ]
              //   }]
              // })

              // getTileUrl - layers
              currentViewerFeatures.forEach(function (feature, index) {
                viewer.world.getItemAt(index + 1).source.getTileUrl = function (level, x, y) {
                  return getIIIFTileUrl(this, level, x, y)
                }
              })
            }, 3000)

          } catch (err) {
            console.error('Filters:', err.message)
          }

        }
      } catch (e) {
        console.error('feature images problem', e)
      }

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

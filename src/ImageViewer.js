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
    this.setSources(viewerIndex, baseImage, featureLayers, opacity, this.setViewer(viewerDivId), options)
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

  setSources(viewerIndex, baseImage, featureLayers, opacity, viewer) {

    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      try {
        // Add FEATURE images to viewer
        if (typeof featureLayers[viewerIndex - 1] === 'undefined') {
          console.log('No features for this viewer', viewerIndex)
        } else {
          let currentViewerFeatures = featureLayers[viewerIndex - 1] // Array starts with 0; viewer indices start with 1

          let currentFeatureOpacity
          if (typeof opacity[viewerIndex - 1] !== 'undefined') {
            currentFeatureOpacity = opacity[viewerIndex - 1]
          } else {
            // Error trapping the case where the number of opacities passed in was wrong.
            let numFeat = featureLayers[viewerIndex - 1].length
            let newArray = []
            let j
            for (j = 0; j < numFeat; j++) {
              newArray[j] = 1.0
            }
            currentFeatureOpacity = newArray
            console.warn('Setting default opacity for viewer', viewerIndex)
          }

          currentViewerFeatures.forEach(function (feature, index) {
            viewer.addTiledImage({tileSource: feature, opacity: currentFeatureOpacity[index], x: 0, y: 0})
          })

          try {

            let zzz = 0

            function checkVariable() {
              zzz = zzz + 1
              console.log(zzz)

              // if (viewer.context) {
              if (viewer.world) {
                console.log('YAY!')
                if (options.colorRanges) {
                  let imf = new imageFiltering()
                  imf.setColorRanges(options.colorRanges)

                  // TODO: MAKE DECISION ON TYPE OF FILTER
                  // Get JSON - if it's segmentation, use 'filter'
                  // If it's anything else (like a heatmap), use 'filter1'

                  // Set filter options
                  // let filter = imf.getFilter() // TODO: HERE!
                  let filter = imf.getFilter1() // todo: here!
                  if (filter !== null) {
                    let itemCount = viewer.world.getItemCount()
                    let i
                    let filterOpts = []

                    for (i = 0; i < itemCount; i++) {
                      if (i > 0) {
                        filterOpts.push({
                          items: viewer.world.getItemAt(i),
                          processors: [
                            filter.prototype.COLORLEVELS(options.colorRanges) // TODO: AND HERE!
                            // filter.prototype.COLORIZE(imf.getColor(i - 1)) // todo: and here!
                          ]
                        })
                      }
                    }

                    viewer.setFilterOptions({
                      filters: filterOpts
                    })
                  }

                  // getTileUrl - layers
                  currentViewerFeatures.forEach(function (feature, index) {
                    try {
                      viewer.world.getItemAt(index + 1).source.getTileUrl = function (level, x, y) {
                        return getIIIFTileUrl(this, level, x, y)
                      }
                    } catch (e) {
                      console.warn('undefined: viewer.world.getItemAt', index + 1)
                    }

                  })

                } else {
                  console.warn('No options.colorRanges. Skipping...')
                }

              }
            }

            setTimeout(checkVariable, 250)

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

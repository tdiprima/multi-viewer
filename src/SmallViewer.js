/**
 * Duplicate of ImageViewer. Just fleshing things out for now.
 * TODO: get rid of duplicate code
 * @param viewerDivId
 * @param options
 * @param data = ????
 * @constructor
 */
const SmallViewer = function (viewerDivId, options, data) {
  let viewer = {}
  setViewer(viewerDivId)

  // Private functions
  function setViewer (viewerDivId) {
    viewer = OpenSeadragon({
      id: viewerDivId,
      prefixUrl: 'vendor/openseadragon/images/',
      showFullPageControl: options.viewerOpts.showFullPageControl,
      showHomeControl: options.viewerOpts.showHomeControl,
      showZoomControl: options.viewerOpts.showZoomControl,
      crossOriginPolicy: 'Anonymous'
    })
  }

  function getIIIFTileUrl (source, level, x, y) {
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

  function showStopperResponse (url, jqXHR) {
    const message = 'ImageViewer.js: Url for the viewer isn\'t good... please check.'
    console.warn(message)
    console.log('jqXHR object:', jqXHR)
    console.log('URL', url)
    // uglify X template literal
    // document.write(`<h1>${message}</h1><b>URL:</b>&nbsp;${url}<br><br><b>Check the console for any clues.`)
    document.write('<h1>' + message + '</h1><b>URL:</b>&nbsp;' + url + '<br><br><b>Check the console for any clues.')
    throw new Error('Something went wrong.') // Terminates the script.
  }

  // Public functions
  return {
    getViewer: function () {
      return viewer
    },
    setSources: function (imageArray, opacityArray) {
      // Quick check url
      $.get(imageArray[0]).done(function () {
        imageArray.forEach(function (image, index) {
          viewer.addTiledImage({ tileSource: image, opacity: opacityArray ? opacityArray[index] : 0, x: 0, y: 0 })
        })
      }).fail(function (jqXHR, statusText) {
        const url = imageArray[0]
        showStopperResponse(url, jqXHR, statusText)
      })

      viewer.world.addHandler('add-item', function () {
        if (viewer.world.getItemCount() === 2) {
          viewer.world.getItemAt(1).source.getTileUrl = function (level, x, y) {
            return getIIIFTileUrl(this, level, x, y)
          }
        }
      })
    }
  }
}

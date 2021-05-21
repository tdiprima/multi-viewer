/**
 * ImageViewer
 * Set up 1 basic OSD viewer.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param data - features and opacities
 */
class ImageViewer {

  constructor(viewerIndex, viewerDivId, baseImage, data, imf, options) {
    this.viewer = {}
    this.options = options
    this.setSources(viewerIndex, baseImage, data, this.setViewer(viewerDivId), imf, this.options)
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
        imageLoaderLimit: 1
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

  setSources(viewerIndex, baseImage, data, viewer, imf, options) {

    // Quick check url
    jQuery.get(baseImage).done(function () {
      // Add BASE image to viewer
      viewer.addTiledImage({tileSource: baseImage, opacity: 1.0, x: 0, y: 0})

      // Add FEATURE layers to viewer
      let features = data.features
      let opacity = data.opacities
      if (features) {
        features.forEach(function (feature, index) {
          let op = (opacity && opacity[index]) ? opacity[index] : 1.0
          viewer.addTiledImage({tileSource: feature, opacity: (op).toFixed(1), x: 0, y: 0})
        })
      }
      overlayFeatures(viewer, imf, options.colorRanges)

    }).fail(function (jqXHR, statusText) {
      dataCheck(baseImage, jqXHR, statusText)
    })

    function overlayFeatures(viewer, imf, colorRanges) {

      try {
        viewer.world.addHandler('add-item', function (event) {
          let itemIndex = viewer.world.getIndexOfItem(event.item)
          if (itemIndex > 0) {
            imf.setViewerFilter(options.colorRanges, viewer)
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

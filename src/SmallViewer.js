const SmallViewer = function (viewerDivId, options, data) {
  let viewer = {}
  viewer = OpenSeadragon({
    id: viewerDivId,
    // prefixUrl: 'vendor/openseadragon/images/',
    prefixUrl: '//openseadragon.github.io/openseadragon/images/',
    showFullPageControl: options.viewerOpts.showFullPageControl,
    showHomeControl: options.viewerOpts.showHomeControl,
    showZoomControl: options.viewerOpts.showZoomControl,
    crossOriginPolicy: 'Anonymous',
    tileSources: data
  })

  let srcWidth, srcHeight
  let updateViewerSize = function (maxWidth, maxHeight) {
    let fit = calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight)
    let div = document.getElementById(viewerDivId)
    div.style.width = fit.width + 'px'
    div.style.height = fit.height + 'px'
    // TODO:
    // if (maxWidth < 500) {
    // }
  }

  viewer.addHandler('open', function () {
    srcHeight = (viewer.world.getItemAt(0).source.dimensions.y / window.devicePixelRatio)
    srcWidth = (viewer.world.getItemAt(0).source.dimensions.x / window.devicePixelRatio)
    let div = document.getElementById(viewerDivId)
    console.log(div.clientWidth, div.clientHeight)
    updateViewerSize(div.clientWidth, div.clientHeight)
  })

  function calculateAspectRatioFit (srcWidth, srcHeight, maxWidth, maxHeight) {
    let ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
    return {
      width: Math.round(srcWidth * ratio),
      height: Math.round(srcHeight * ratio)
    }
  }

  // Public functions
  return {
    getImageDims: function () {
      return {width: srcWidth, height: srcHeight}
    },
    getViewer: function () {
      return viewer
    },
    zoom: function () {
      let center = new OpenSeadragon.Point(srcWidth / 2, srcHeight / 2)
      console.log('center', center)
      let point = viewer.viewport.imageToViewportCoordinates(center)
      viewer.viewport.panTo(new OpenSeadragon.Point(point.x, point.y))
      viewer.viewport.zoomTo(viewer.viewport.getMaxZoom())
    },
    updateViewerSize: function (maxWidth, maxHeight) {
      let fit = calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight)
      let div = document.getElementById(viewerDivId)
      div.style.width = fit.width + 'px'
      div.style.height = fit.height + 'px'
    }
  }
}

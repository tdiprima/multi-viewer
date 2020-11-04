const panZoom = function (vpt, rectangle) {
  vpt.panTo(rectangle.getCenter())
  console.log('zoomTo:', vpt.getMaxZoom())
  vpt.zoomTo(vpt.getMaxZoom()) // wsi 165
  // vpt.zoomTo(15) // 15 semi-works with WSI but not with Duomo
}

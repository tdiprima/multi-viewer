const panZoom = function (vpt, rectangle) {
  vpt.panTo(rectangle.getCenter())
  // const zoom = vpt.getMaxZoom()
  // const zoom = 165
  const zoom = 15
  console.log('zoomTo', zoom)
  vpt.zoomTo(zoom)
}

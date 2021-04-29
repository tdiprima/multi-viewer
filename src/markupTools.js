const markupTools = function (idx, viewer) {
  console.log('markupTools.js')
  const overlay = viewer.fabricjsOverlay({
    scale: 1000
  })

  drawPolygon(idx, viewer, overlay)
  editPolygon(idx, overlay)
  gridOverlay(idx, overlay)
  // ruler(idx, viewer, overlay)
}

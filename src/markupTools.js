const markupTools = function (viewerInfo, viewer) {
  const overlay = viewer.fabricjsOverlay({ scale: 1000 })
  let idx = viewerInfo.idx
  // Note: pass the overlay to all the functions
  drawPolygon(viewerInfo, viewer, overlay)
  editPolygon(document.getElementById('btnEdit' + idx), overlay)
  gridOverlay(document.getElementById('btnGrid' + idx), document.getElementById('btnGridMarker' + idx), overlay)
  ruler(document.getElementById('btnRuler' + idx), viewer, overlay)
  blender(document.getElementById('btnBlender' + idx), viewer)
}

function markupTools (idx, viewer) {
  const overlay = viewer.fabricjsOverlay({
    scale: 1000
  })

  // call this and that
  drawPolygon(idx, viewer, overlay)
  editPolygon(idx, overlay)
  gridOverlay(idx, viewer, overlay)
}

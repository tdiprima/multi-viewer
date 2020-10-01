function markupTools (idx, viewer) {
  const overlay = viewer.fabricjsOverlay({
    scale: 1000
  })

  drawPolygon(idx, viewer, overlay)
  editPolygon(idx, overlay)
  gridOverlay(idx, viewer, overlay)
}

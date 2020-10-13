// eslint-disable-next-line no-unused-vars
const markupTools = function (idx, viewer) {
  const overlay = viewer.fabricjsOverlay({
    scale: 1000
  })

  drawPolygon(idx, viewer, overlay) // eslint-disable-line no-undef
  editPolygon(idx, overlay) // eslint-disable-line no-undef
  gridOverlay(idx, overlay) // eslint-disable-line no-undef
}

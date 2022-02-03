/**
 * Create the fabric.js overlay and pass it to the markup tools.
 *
 * @param viewerInfo
 *     divId: id for viewer div HTML element
 *     idx: viewer index (array of viewers)
 *     len: num images to display
 * @param options
 * @param viewer
 */
const markupTools = (viewerInfo, options, viewer) => {
  const overlay = viewer.fabricjsOverlay({scale: 1, static: false})
  const idx = viewerInfo.idx

  drawPolygon(viewerInfo, viewer, overlay)

  editPolygon(document.getElementById(`btnEdit${idx}`), overlay)

  gridOverlay(document.getElementById(`btnGrid${idx}`), document.getElementById(`btnGridMarker${idx}`), overlay)

  ruler(document.getElementById(`btnRuler${idx}`), viewer, overlay)

  blender(document.getElementById(`btnBlender${idx}`), viewer)

  let canvas = overlay.fabricCanvas()
  canvas.on('after:render', function () {
    canvas.calcOffset()
  })

  // SAVE
  let btnSave = document.getElementById(`btnSave${viewerInfo.idx}`)
  btnSave.addEventListener('click', () => {
    saveSettings(canvas, options)
  })

}

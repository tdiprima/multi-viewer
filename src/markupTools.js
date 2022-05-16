/**
 * Create the fabric.js overlay and pass it to the markup tools.
 */
const markupTools = (viewerInfo, options, viewer) => {
  const overlay = viewer.fabricjsOverlay({ scale: 1, static: false });
  const idx = viewerInfo.idx;

  drawPolygon(viewerInfo, viewer, overlay);

  editPolygon(document.getElementById(`btnEdit${idx}`), overlay);

  gridOverlay(
    document.getElementById(`btnGrid${idx}`),
    document.getElementById(`btnGridMarker${idx}`),
    overlay,
  );

  ruler(document.getElementById(`btnRuler${idx}`), viewer, overlay);

  blender(document.getElementById(`btnBlender${idx}`), viewer);

  const canvas = overlay.fabricCanvas();
  canvas.on('after:render', () => {
    canvas.calcOffset();
  });

  // destructoTest(canvas);

  // SAVE
  const btnSave = document.getElementById(`btnSave${viewerInfo.idx}`);
  btnSave.addEventListener('click', () => {
    saveSettings(canvas, options);
  });
};

/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerIndex
 * @param viewerDivId
 * @param baseImage
 * @param data: features and opacities
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, data, numViewers, options) {
    super(viewerIndex, viewerDivId, baseImage, data, options)

    if (typeof options === 'undefined') {
      options = {}
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    }

    this.viewer1 = super.getViewer()
    this.idx = viewerIndex

    if (numViewers > 1) {
      this.checkboxes.checkPan = document.getElementById('chkPan' + this.idx)
      this.checkboxes.checkZoom = document.getElementById('chkZoom' + this.idx)
    }

    if (options.toolbarOn) {
      markupTools(this.idx, this.viewer1)
    }

    // LAYERS
    if (typeof data.features !== 'undefined' && options.draggableLayers) {
      // This function is placed to the right of the viewer:
      layers(`layers_and_colors${this.idx}`, this.viewer1, data)
      // Create/handle floating layers div
      let layersBtn = document.getElementById(`layers${this.idx}`)
      let widget = layers('', this.viewer1, data, layersBtn)
      layersBtn.addEventListener('click', function (e) {
        widget.style.display = 'block'
      })
    }

    try {
      // COLOR PALETTE
      let palette = document.getElementById('palette' + this.idx)
      if (typeof options.colorRanges !== 'undefined' && typeof palette !== 'undefined') {
        // Create/handle floating layers div
        let widget = filters(this.viewer1, options.colorRanges, palette)
        palette.addEventListener('click', function (e) {
          widget.style.display = 'block'
        })
      }
    } catch (e) {
      console.error('COLOR PALETTE:', e)
    }
  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

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
      layers(`layers_and_colors${this.idx}`, this.viewer1, data)
    }

  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerIndex
 * @param viewerDivId
 * @param data: features and opacities
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, data, numViewers, options) {
    super(viewerIndex, viewerDivId, data, options)

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

    // TEMPORARY. WILL REQUIRE CR PER LAYER IN NEAR FUTURE.
    if (!data.colorRanges) {
      console.log("data.colorRanges doesn't exist. Creating...")
      if (options.colorRanges) {
        data['colorRanges'] = options.colorRanges
      } else {
        console.warn("options.colorRanges doesn't exist")
      }
    }

    // LAYERS
    if (typeof data.features !== 'undefined') {
      layers(`layers_and_colors${this.idx}`, this.viewer1, data)
    } else {
      console.error('data.features is undefined or null\nHINT: Keys should be in quotes!')
      console.log("****** HERE'S 'DATA':", data, " ******")
    }

  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

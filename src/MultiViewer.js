/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerInfo.idx
 * @param viewerInfo.divId
 * @param imagesToBeDisplayed: array
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerInfo, imagesToBeDisplayed, numViewers, options) {
    super(viewerInfo, imagesToBeDisplayed, options)

    if (typeof options === 'undefined') {
      options = {}
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    }

    this.viewer1 = super.getViewer()
    this.idx = viewerInfo.idx

    if (numViewers > 1) {
      this.checkboxes.checkPan = document.getElementById('chkPan' + this.idx)
      this.checkboxes.checkZoom = document.getElementById('chkZoom' + this.idx)
    }

    if (options.toolbarOn) {
      markupTools(this.idx, this.viewer1)
    }

    layers(`layers_and_colors${this.idx}`, this.viewer1, imagesToBeDisplayed)

  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

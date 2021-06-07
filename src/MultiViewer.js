/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerInfo
 * @param itemsToBeDisplayed
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerInfo, itemsToBeDisplayed, numViewers, options) {
    super(viewerInfo, itemsToBeDisplayed, options)

    if (typeof options === 'undefined') {
      options = {}
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    }

    this.viewer1 = super.getViewer()

    if (numViewers > 1) {
      this.checkboxes.checkPan = document.getElementById('chkPan' + viewerInfo.idx)
      this.checkboxes.checkZoom = document.getElementById('chkZoom' + viewerInfo.idx)
    }

    if (options.toolbarOn) {
      markupTools(viewerInfo.idx, this.viewer1)
    }

    layers(`layers_and_colors${viewerInfo.idx}`, this.viewer1, itemsToBeDisplayed)

  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

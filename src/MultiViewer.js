/**
 * Wrapper component around OpenSeadragon viewer.
 * Set up OSD viewer to allow for multiple viewer control.
 */
class MultiViewer extends ImageViewer {
  /**
   * @constructor
   * @param viewerInfo - Info specific to 'this' viewer
   * @param numViewers - Total number of viewers.
   * @param options - Filters, paintbrush, etc.
   */
  constructor(viewerInfo, numViewers, options) {
    super(viewerInfo);

    if (typeof options === 'undefined') {
      options = {};
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    };

    if (numViewers > 1) {
      this.checkboxes.checkPan = document.getElementById(`chkPan${viewerInfo.idx}`);
      this.checkboxes.checkZoom = document.getElementById(`chkZoom${viewerInfo.idx}`);
    }

    if (options.toolbarOn) {
      markupTools(viewerInfo, options, super.getViewer());
    }

    layerUI(
      document.getElementById(`layersAndColors${viewerInfo.idx}`),
      viewerInfo.layers,
      super.getViewer(),
    );
  }

  getViewer() {
    return super.getViewer();
  }

  getPanZoom() {
    return this.checkboxes;
  }
}

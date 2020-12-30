class MultiViewer extends ImageViewer {
  constructor (viewerDivId, imageArray, opacityArray, sliderElements, numDivs, options) {
    super(viewerDivId, imageArray, opacityArray)

    if (typeof sliderElements === 'undefined' || typeof numDivs === 'undefined' || typeof options === 'undefined') {
      throw 'Wrong construction. Did you mean to use ImageViewer?'
    }

    this.checkboxes = {
      checkPan: true,
      checkZoom: true
    }

    this.viewer1 = super.getViewer()
    this.idx = viewerDivId.replace('viewer', '')
    this.sliders = sliderElements

    if (numDivs > 1 && options.toolbarOn) {
      this.checkboxes.checkPan = document.getElementById('chkPan' + this.idx)
      this.checkboxes.checkZoom = document.getElementById('chkZoom' + this.idx)
    }

    if (options.slidersOn) {
      let i
      for (i = 0; i < this.sliders.length; i++) {
        this.sliders[i].addEventListener('input', function () {
          if (this.viewer1.world.getItemAt(i) !== undefined) {
            this.viewer1.world.getItemAt(i).setOpacity(this.sliders[i].value / 100)
          } else {
            this.sliders[i].hidden = true
          }
        })
      }
    }

    if (options.toolbarOn) {
      markupTools(this.idx, this.viewer1)
    }
  }

  getViewer () {
    return this.viewer1
  }

  getPanZoom () {
    return this.checkboxes
  }
}

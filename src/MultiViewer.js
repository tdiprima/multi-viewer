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
      addInputHandler(this.sliders, this.viewer1)
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

function addInputHandler (sliderElem, viewerElem) {
  let i
  for (i = 0; i < sliderElem.length; i++) {
    // Sliders change opacity of slide
    sliderElem[i].addEventListener('input', function () {
      if (viewerElem.world.getItemAt(i) !== undefined) {
        viewerElem.world.getItemAt(i).setOpacity(this.value / 100)
      } else {
        this.hidden = true
      }
    })
  }
}

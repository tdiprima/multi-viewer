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
    // if (this.viewer1) {
    //   console.warn('Yay, viewer1', this.viewer1)
    // }
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
  // console.log(sliderElem, viewerElem)
  let i
  for (i = 0; i < sliderElem.length; i++) {
    // console.log('sliderElem[i]', i, sliderElem[i])
    // Sliders change opacity of slide
    sliderElem[i].addEventListener('input', function () {
      let idx = this.id.replace('sliderRange', '') - 1
      // console.log('this', idx, this.id)
      let w = viewerElem.world.getItemAt(idx)
      // console.log('world item', idx, w)
      if (viewerElem.world.getItemAt(idx) !== undefined) {
        viewerElem.world.getItemAt(idx).setOpacity(this.value / 100)
      } else {
        this.hidden = true
      }
    })
  }
}

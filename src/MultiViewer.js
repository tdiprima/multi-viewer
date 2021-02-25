class MultiViewer extends ImageViewer {
  /**
   *
   * @param viewerDivId: (viewer1, viewer2...)
   * @param srcImgPair: Source image pair (array of base image + layer image)
   * @param opacityArray: Opacity for the image pair.
   * @param sliderElements
   * @param numViewers: Total number of viewers.
   * @param options: Filters, paintbrush, sliders, etc.
   */
  constructor(viewerDivId, srcImgPair, opacityArray, sliderElements, numViewers, options) {
    super(viewerDivId, srcImgPair, opacityArray)
    // console.log('viewerDivId', viewerDivId, 'sliderElements', sliderElements)

    if (typeof sliderElements === 'undefined' || typeof numViewers === 'undefined' || typeof options === 'undefined') {
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

    if (numViewers > 1 && options.toolbarOn) {
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

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

function addInputHandler(sliderElem, viewerElem) {
  // console.log(sliderElem, viewerElem)
  let i
  for (i = 0; i < sliderElem.length; i++) {
    // console.log('sliderElem[i]', i, sliderElem[i])
    // Sliders change opacity of slide
    sliderElem[i].addEventListener('input', function () {
      let idx
      const num = this.id.replace('sliderRange', '') - 1
      if (num % 2 === 0) {
        idx = 0
      } else {
        idx = 1
      }
      // console.log('this', idx, this.id)
      const worldItem = viewerElem.world.getItemAt(idx)
      // console.log('world item', idx, worldItem)
      if (worldItem !== undefined) {
        worldItem.setOpacity(this.value / 100)
      } else {
        this.hidden = true
      }
    })
  }
}

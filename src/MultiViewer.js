/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param layers
 * @param sliderElements: 2 slides per image viewer (controls image opacity and overlay opacity).
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, sliderElements, numViewers, options) {
    super(viewerIndex, viewerDivId, baseImage, featureLayers)

    try {
      this.checkboxes = {
        checkPan: true,
        checkZoom: true
      }

      this.viewer1 = super.getViewer()
      this.idx = viewerIndex
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
    } catch (e) {
      console.log(e)
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
      const num = this.id.replace('sliderRange', '') - 1  // sliderRange1, sliderRange2, ...
      if (num % 2 === 0) { // They're paired.
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

/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerIndex
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param featureLayers
 * @param opacity - feature opacity
 * @param sliderElements: 2 slides per image viewer (controls image opacity and overlay opacity).
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */
class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, sliderElements, numViewers, options) {
    let imf
    imf = new filters(options.colorRanges)
    super(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, imf, options)

    if (typeof options === 'undefined') {
      options = {}
    }

    try {
      this.checkboxes = {
        checkPan: true,
        checkZoom: true
      }

      this.viewer1 = super.getViewer()
      this.idx = viewerIndex
      this.sliders = sliderElements

      if (numViewers > 1) {
        this.checkboxes.checkPan = document.getElementById('chkPan' + this.idx)
        this.checkboxes.checkZoom = document.getElementById('chkZoom' + this.idx)
      }

      if (options.slidersOn && options.toolbarOn) {
        addInputHandler(this.sliders, this.viewer1)
      }

      if (options.toolbarOn) {
        markupTools(this.idx, this.viewer1)
      }

      if (options.draggableLayers) {
        handleDraggable()
      }

      let layersBtn = document.getElementById('colors' + this.idx)
      if (layersBtn) {
        if (options.colorRanges) {
          imf.handleColorLevels(layersBtn, this.viewer1)
        } else {
          console.warn("No colors, no button for you.")
          layersBtn.style.visibility = hidden
        }
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
  // 2 x numViewers = total number of sliders
  let i
  for (i = 0; i < sliderElem.length; i++) {
    // SLIDER EVENT LISTENER
    sliderElem[i].addEventListener('input', function () {
      let layerNum
      const num = this.id.replace('sliderRange', '') - 1  // sliderRange1, sliderRange2, ...
      if (num % 2 === 0) { // They're paired.
        layerNum = 0 // 1st slider affects the base layer
      } else {
        layerNum = 1 // 2nd slider affects the first layer
      }
      const worldItem = viewerElem.world.getItemAt(layerNum)
      if (worldItem !== undefined) {
        worldItem.setOpacity(this.value / 100) // SET OPACITY
      } else {
        // In case of 2 sliders with only 1 layer - hide the slide.
        this.hidden = true
      }
    })
  }
}

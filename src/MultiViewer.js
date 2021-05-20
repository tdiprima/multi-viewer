/**
 * MultiViewer
 * Set up OSD viewer to allow for multiple viewer control.
 *
 * @param viewerIndex
 * @param viewerDivId: (viewer1, viewer2...)
 * @param baseImage
 * @param data - features and opacities
 * @param sliderElements: 2 slides per image viewer (controls image opacity and overlay opacity).
 * @param numViewers: Total number of viewers.
 * @param options: Filters, paintbrush, sliders, etc.
 */

class MultiViewer extends ImageViewer {
  constructor(viewerIndex, viewerDivId, baseImage, data, sliderElements, numViewers, options) {
    let imf = new filters()
    super(viewerIndex, viewerDivId, baseImage, data, imf, options)

    if (typeof options === 'undefined') {
      options = {}
    }

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

      // LAYERS
      let layersBtn = document.getElementById(`layers${this.idx}`)

      if (typeof data.features !== 'undefined') {
        // This function is placed to the right of the viewer:
        layers(`layers_and_colors${this.idx}`, this.viewer1, data)

        if (options.draggableLayers && layersBtn) {
          // Then create/handle floating layers div
          layers('layersBody', this.viewer1, data, layersBtn)
          // TODO: don't create every time - hide and viz.
        } else {
          console.log(`Viewer ${this.viewer1.id} has no layers. Removing layers button.`)
          layersBtn.style.display = 'none'
        }
      }

    try {
      // COLOR PALETTE
      let palette = document.getElementById('palette' + this.idx)
      if (palette) {
        if (options.colorRanges) {
          imf.handleColorLevels(palette, this.viewer1, options.colorRanges)
        } else {
          console.log('Removing colors button.')
          palette.style.display = 'none'
        }
      }
    } catch (e) {
      console.error('COLOR PALETTE:', e)
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

// Image viewer module

// ImageViewer - subclass
function ImageViewer (viewerDivId, sliderElements, numDivs, options) {
  // Call constructor of superclass to initialize superclass-derived members.
  SmallViewer.call(this, viewerDivId)

  // Initialize subclass's own members
  this.idx = viewerDivId.replace('viewer', '')
  this.checkboxes = {
    checkPan: true,
    checkZoom: true
  }
  this.sliders = sliderElements

  if (numDivs > 1 && options.toolbarOn) {
    this.checkboxes.checkPan = document.getElementById('chkPan' + this.idx)
    this.checkboxes.checkZoom = document.getElementById('chkZoom' + this.idx)
  }

  if (options.slidersOn) {
    let i
    for (i = 0; i < this.sliders.length; i++) {
      this.sliders[i].addEventListener('input', function () {
        if (this.viewer.world.getItemAt(i) !== undefined) {
          this.viewer.world.getItemAt(i).setOpacity(this.sliders[i].value / 100)
        } else {
          this.sliders[i].hidden = true
        }
      })
    }
  }

  if (options.toolbarOn) {
    markupTools(this.idx, this.viewer)
  }
}

// ImageViewer derives from SmallViewer
ImageViewer.prototype = Object.create(SmallViewer.prototype)
ImageViewer.prototype.constructor = ImageViewer // Set constructor back to ImageViewer

// Subclass methods. Add them after ImageViewer.prototype is created with
// Object.create
ImageViewer.prototype.getViewer = function () {
  return this.viewer
}

ImageViewer.prototype.getPanZoom = function () {
  return this.checkboxes
}

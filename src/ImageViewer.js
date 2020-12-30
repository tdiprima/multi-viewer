// Image viewer module
const ImageViewer = function (viewerDivId, sliderElements, numDivs, options) {
  SmallViewer.call(this, viewerDivId)
  // ImageViewer derives from SmallViewer
  ImageViewer.prototype = Object.create(SmallViewer.prototype)
  ImageViewer.prototype.constructor = ImageViewer // Set constructor back to ImageViewer

  console.log(getViewer())
  // Private variables
  const idx = viewerDivId.replace('viewer', '')
  const checkboxes = {
    checkPan: true,
    checkZoom: true
  }

  const sliders = sliderElements

  // Call functions.
  setCheckboxes(idx)
  setSliders(viewer)
  // Done calling functions.

  // Private functions
  function setCheckboxes (idx) {
    if (numDivs > 1 && options.toolbarOn) {
      checkboxes.checkPan = document.getElementById('chkPan' + idx)
      checkboxes.checkZoom = document.getElementById('chkZoom' + idx)
    }
  }

  if (options.toolbarOn) {
    markupTools(idx, this.viewer)
  }

  function setSliders () {
    if (options.slidersOn) {
      let i
      for (i = 0; i < sliders.length; i++) {
        sliders[i].addEventListener('input', function () {
          if (viewer.world.getItemAt(i) !== undefined) {
            viewer.world.getItemAt(i).setOpacity(sliders[i].value / 100)
          } else {
            sliders[i].hidden = true
          }
        })
      }
    }
  }

  // Public functions
  return {
    getPanZoom: function () {
      return checkboxes
    },

    setSources: function (imageArray, opacityArray) {
      // Quick check url
      $.get(imageArray[0]).done(function () {
        imageArray.forEach(function (image, index) {
          viewer.addTiledImage({ tileSource: image, opacity: opacityArray ? opacityArray[index] : 0, x: 0, y: 0 })
        })
      }).fail(function (jqXHR, statusText) {
        const url = imageArray[0]
        dataCheck(url, jqXHR, statusText)
      })

      viewer.world.addHandler('add-item', function (event) {
        if (viewer.world.getItemCount() === 2) {
          if (options.filterOn) {
            viewer.setFilterOptions({
              filters: [{
                items: viewer.world.getItemAt(1),
                processors: [
                  filter.prototype.COLORIZE(0, 255, 0)
                ]
              }]
            })
          }

          viewer.world.getItemAt(1).source.getTileUrl = function (level, x, y) {
            return getIIIFTileUrl(this, level, x, y)
          }
        }
      })
    }
  }
}

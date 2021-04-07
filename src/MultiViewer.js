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
  constructor(viewerIndex, viewerDivId, baseImage, featureLayers, opacity, sliderElements, numViewers, options) {
    super(viewerIndex, viewerDivId, baseImage, featureLayers, opacity)

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

      if (options.draggableLayers) {
        handleDraggable()
      }
    } catch (e) {
      console.warn(e)
    }

  }

  getViewer() {
    return this.viewer1
  }

  getPanZoom() {
    return this.checkboxes
  }

}

function handleDraggable() {
  let items = document.querySelectorAll('.tab_links')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    item.addEventListener('click', handleDragStart) // will this fix it?
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  items = document.querySelectorAll('.tab')
  items.forEach(function (item) {
    item.addEventListener('dragenter', handleDragEnter, false)
    item.addEventListener('dragleave', handleDragLeave, false)
    item.addEventListener('dragover', handleDragOver, false)
    item.addEventListener('drop', handleDrop, false)
  })

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault()
    }
    return false
  }

  function handleDragEnter(e) {
    this.classList.add('over')
  }

  function handleDragLeave(e) {
    this.classList.remove('over')
  }

  function handleDragStart(e) {
    this.style.opacity = '0.4'
    dragSrcEl = this // The draggable feature
    sourceViewer = whichViewer(dragSrcEl.parentElement.parentElement)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text', e.target.id)
  }

  function handleDragEnd(e) {
    this.style.opacity = '1'
    items.forEach(function (item) {
      item.classList.remove('over')
    })
  }

  function handleDrop(e) {
    e.stopPropagation()
    if (dragSrcEl !== this) {
      // get the element that was dragged
      let movedTab = e.dataTransfer.getData('text')
      // get the (new) parent element
      let parent = e.target.parentElement
      // Only drop to specific elements
      if (parent.classList.contains('divSquare')) {
        e.target.appendChild(document.getElementById(movedTab))
        // TODO: Keep track of which tab belongs to what layer number.
        let layer
        let targetViewer = whichViewer(parent)
        layer = targetViewer.world.getItemCount() - 1 // get the last layer (TODO: change)
        targetViewer.world.getItemAt(layer).setOpacity(1.0)
        layer = sourceViewer.world.getItemCount() - 1 // get the last layer
        sourceViewer.world.getItemAt(layer).setOpacity(0.0)
      }
    }
    return false
  }
}

function whichViewer(element) {
  let children = element.children
  let retVal, i, j
  for (i = 0; i < children.length; i++) {
    let el = children[i]
    if (el.classList.contains('viewer')) {
      try {
        // It's this viewer. Retrieve the viewer object.
        for (j = 0; j < syncedImageViewers.length; j++) {
          if (syncedImageViewers[j].getViewer().id === el.id) {
            retVal = syncedImageViewers[j].getViewer()
            break
          }
        }
      } catch (e) {
        console.warn('No syncedImageViewers')
      }
    }
  }
  return retVal
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

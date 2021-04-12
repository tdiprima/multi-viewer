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

      handleColorLevels(this.idx, this.viewer1)

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

function handleColorLevels(idx, viewer) {
  // COLOR RANGE POPUP
  let myDiv
  document.getElementById('colors' + idx).addEventListener('click', function (event) {
    event = event || window.event
    try {
      console.log('X:', event.clientX, event.layerX, event.pageX)
      console.log('Y:', event.clientY, event.layerY, event.pageY)
    }
    catch (err) {
      console.log('EVENT:', err.message)
    }

    myDiv = document.createElement('div')
    myDiv.id = 'myDiv'

    const img = document.createElement('img')
    img.src = 'images/close_icon.png'
    img.width = '25'
    img.height = '25'
    img.style = 'float: left'
    img.addEventListener('click', function () {
      this.parentNode.remove()
    })
    myDiv.appendChild(img)

    const myDivHeader = document.createElement('div')
    myDivHeader.id = 'myDivHeader'
    myDivHeader.innerHTML = 'Move this DIV'
    myDiv.appendChild(myDivHeader)

    const colors = ['#FF0000', '#FF9900', '#FFFF00', '#01B9F5', '#0000FF', '#8713AC', '#FFFFFF00']
    const numbers = [200, 170, 140, 100, 75, 30, 0]
    colors.forEach(function (color, index) {
      const div = document.createElement('div')
      div.id = 'color' + index
      div.style.backgroundColor = color
      div.style.width = '20px'
      div.style.height = '20px'
      div.innerHTML = numbers[index]
      myDiv.appendChild(div)
      myDiv.appendChild(document.createElement('BR'))
    })

    myDiv.style.left = event.clientX + 'px'
    myDiv.style.top = event.clientY + 'px'

    document.body.appendChild(myDiv)

    let imf1 = new imageFiltering()
    let filter1 = imf1.getFilter1()
    // console.log(filter1)
    // TODO! Layer #!
    viewer.setFilterOptions({
      filters: [{
        items: viewer.world.getItemAt(1),
        processors: [
          filter1.prototype.COLORLEVELS({})
        ]
      }]
    })

    // Make the DIV element draggable:
    dragElement(myDiv)
  })
}

function dragElement(elmnt) {
  var pos1 = 0
  var pos2 = 0
  var pos3 = 0
  var pos4 = 0

  if (document.getElementById(elmnt.id + 'Header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + 'Header').onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown
  }

  function dragMouseDown(e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
  }

  function elementDrag(e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
    elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
  }
}

// DRAGGABLE LAYER TABS
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

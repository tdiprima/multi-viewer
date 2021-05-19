let layers = function (button, arr, viewer) {
  button.addEventListener('click', function (e) {
    createDraggableDiv('layers', 'Features', e.clientX, e.clientY)
    createLayerWidget(arr, document.getElementById('layersBody'), viewer)
    handleDragLayers(viewer)
  })
}

let createLayerWidget = function (arr, div, viewer) {
  const table = document.createElement('table')
  div.appendChild(table)

  arr.forEach(function (layer, ind) {
    let layerNum = ind + 1 // skip base
    let tr, cell, span, eye, fas
    tr = table.insertRow(-1)
    table.appendChild(tr)

    // DRAGGABLE FEATURE TAB
    cell = tr.insertCell(-1)
    span = document.createElement('span')
    span.className = 'tab_links'
    span.id = makeId(5, 'feat')
    span.setAttribute('draggable', 'true')
    span.innerHTML = layer.hashCode() // HASH OF NAME
    cell.appendChild(span)

    // EYEBALL VISIBILITY TOGGLE
    cell = tr.insertCell(-1)
    eye = document.createElement('i')
    eye.classList.add('fas')
    eye.classList.add('fa-eye')
    eye.id = makeId(5, 'eye')
    cell.appendChild(eye)
    eye.addEventListener('click', function () {
      toggleButton(this, 'fa-eye', 'fa-eye-slash', function () {
        if (eye.classList.contains('fa-eye')) {
          // Turn on layer
          viewer.world.getItemAt(layerNum).setOpacity(1)
        } else {
          // Turn off layer
          viewer.world.getItemAt(layerNum).setOpacity(0)
        }
      })
    })

    // PALETTE COLOR FUNCTION
    cell = tr.insertCell(-1)
    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-palette')
    fas.id = makeId(5, 'palette')
    fas.style.cursor = 'pointer'
    cell.appendChild(fas)

  })
}

// DRAGGABLE LAYERS (previously in tabs, now list)
let handleDragLayers = function (viewer) {
  // Features in feature list
  let items = document.querySelectorAll('.tab_links')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  // The viewer, basically
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
    sourceViewer = viewer
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
      const target = e.target
      // get closest viewer element to where we dropped it
      const closestElement = target.closest('.viewer')
      if (!closestElement) {
        return false
      }
      // get the element that was dragged
      let movedElemId = e.dataTransfer.getData('text')
      // get the actual viewer object
      let targetViewer = getViewerObject(closestElement)
      let layerNum = movedElemId[0] // 1st char is array index
      layerNum = parseInt(layerNum) + 1 // (bc 0 = base)
      targetViewer.world.getItemAt(layerNum).setOpacity(1.0)
      sourceViewer.world.getItemAt(layerNum).setOpacity(0.0)
    }
    return false
  }
}

function getViewerObject(element) {
  let retVal

  try {
    // syncedImageViewers = global variable set in synchronizeViewers.js
    let j
    for (j = 0; j < syncedImageViewers.length; j++) {
      if (syncedImageViewers[j].getViewer().id === element.id) {
        retVal = syncedImageViewers[j].getViewer()
        break
      }
    }
  } catch (e) {
    console.error('getViewerObject:', e.message)
  }

  return retVal
}

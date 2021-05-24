let layers = function (divName, viewer, data, button) {
  if (isRealValue(button)) {
    button.addEventListener('click', function (e) {
      createDraggableDiv('layers', 'Features', e.clientX, e.clientY)
      createLayerWidget(document.getElementById(divName), viewer, data)
      handleDragLayers(viewer) // TODO: PARMS
    })
  } else {
    createLayerWidget(document.getElementById(divName), viewer, data)
    handleDragLayers(viewer)
  }
}

let eyeball = function (eye, layerNum, viewer) {
  let l = viewer.world.getItemAt(layerNum)
  if (l) {
    if (eye.classList.contains('fa-eye')) {
      // Turn on layer
      l.setOpacity(1)
    } else {
      // Turn off layer
      l.setOpacity(0)
    }
  } else {
    console.log('here')
  }
}

let createLayerWidget = function (div, viewer, data) {
  const table = document.createElement('table')
  div.appendChild(table)
  let layers = data.features
  let opacities = data.opacities
  layers.forEach(function (layer, ind) {
    let layerNum = ind + 1 // skip base
    let tr, cell, span, eye, fas
    tr = table.insertRow(-1)
    table.appendChild(tr)

    // DRAGGABLE FEATURE TAB
    cell = tr.insertCell(-1)
    span = document.createElement('span')
    span.className = 'layer_tab'
    span.id = ind + makeId(5, 'feat')
    span.setAttribute('draggable', 'true')
    span.display = 'block'
    span.innerHTML = getStringRep(layer) // WAITING FOR skos:prefLabel
    cell.appendChild(span)

    // EYEBALL VISIBILITY TOGGLE
    cell = tr.insertCell(-1)
    eye = document.createElement('i')
    eye.classList.add('fas')
    if (opacities[ind] === 1)
      eye.classList.add('fa-eye')
    else
      eye.classList.add('fa-eye-slash')
    // eyeball(eye, layerNum, viewer) // viewer.world... undefined here.

    eye.id = makeId(5, 'eye')
    cell.appendChild(eye)

    // EYEBALL EVENT LISTENER
    eye.addEventListener('click', function () {
      toggleButton(eye, 'fa-eye', 'fa-eye-slash')
      eyeball(eye, layerNum, viewer)
    })

    // PALETTE COLOR FUNCTION
    cell = tr.insertCell(-1)
    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-palette')
    fas.id = makeId(5, 'palette')
    fas.style.cursor = 'pointer'
    cell.appendChild(fas)
    // TODO:
    // new filters().handleColorLevels(fas, viewer, options.colorRanges)
  })
}

// DRAGGABLE LAYERS (previously in tabs, now list)
let handleDragLayers = function (viewer) {
  let dragSrcEl, sourceViewer

  // Features in feature list
  let items = document.querySelectorAll('.layer_tab')
  items.forEach(function (item) {
    item.setAttribute('draggable', 'true')
    item.addEventListener('dragstart', handleDragStart, false)
    item.addEventListener('dragend', handleDragEnd, false)
  })

  // The viewer, basically
  items = document.querySelectorAll('.drop_site')
  items.forEach(function (item) {
    item.addEventListener('dragenter', handleDragEnter, false)
    item.addEventListener('dragleave', handleDragLeave, false)
    item.addEventListener('dragover', handleDragOver, false)
    item.addEventListener('drop', handleDrop, false)
  })

  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault()
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

  /************ HANDLE DROP ************/
  function handleDrop(e) {
    if (e.preventDefault) e.preventDefault()

    if (dragSrcEl !== this) {
      // TARGET
      const target = e.target
      const closestViewer = target.closest('.viewer')
      if (!closestViewer) {
        return false
      }

      // DRAGGED ITEM
      let movedElemId = e.dataTransfer.getData('text')
      let tmpEl = document.getElementById(movedElemId)
      let tmpId = tmpEl.id
      let tmpHtml = tmpEl.innerHTML
      let items = document.querySelectorAll('.layer_tab')
      for (let i = 0; i < items.length; i++) {
        let layerTab = items[i]
        if (layerTab.innerHTML === tmpHtml && layerTab.id !== tmpId) {
          // Great, we got a match.
          // Toggle eyeball.
          let tds = layerTab.parentElement.parentElement.children
          let eye = tds[1].children[0]
          toggleButton(eye, 'fa-eye', 'fa-eye-slash')
          layerTab.classList.remove('highlight')
          layerTab.classList.add('highlight')
        }
      }

      // VIEWER
      let targetViewer = getViewerObject(closestViewer)
      let layerNum = movedElemId[0] // 1st char is array index
      layerNum = parseInt(layerNum) + 1 // (bc 0 = base)
      targetViewer.world.getItemAt(layerNum).setOpacity(1)
      sourceViewer.world.getItemAt(layerNum).setOpacity(0)
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

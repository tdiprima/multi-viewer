let layers = function (divName, viewer, data, button) {
  let div
  if (isRealValue(button)) {
    let id = makeId(5, 'layers')
    let rect = button.getBoundingClientRect()
    div = createDraggableDiv(id, 'Features', rect.left, rect.top)
    createLayerWidget(document.getElementById(`${id}Body`), viewer, data)
    handleDragLayers(viewer)
  } else {
    createLayerWidget(document.getElementById(divName), viewer, data)
    handleDragLayers(viewer)
  }
  return div
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
  }
}

function rangeValue(range, val) {
  // If the value is not specified, the default value is "50" - https://www.w3schools.com/jsref/prop_range_value.asp
  range.value = '100' // this works
  console.log("'100' -> " + range.value) // '100' -> 100

  range.value = "'" + val.toString() + "'" // this totally doesn't work
  console.log("'" + val.toString() + "'" + " -> " + range.value) // '1' -> 50

  range.value = "'" + val + "'" // neither does this
  console.log("'" + val + "'" + " -> " + range.value) // '1' -> 50

  range.value = val.toString() // this seems to be right but the range is at the 0 mark when displayed
  console.log(val.toString() + " -> " + range.value) // 1 -> 1

  range.value = val // ditto.
  console.log(val + " -> " + range.value) // 1 -> 1

  console.log(typeof range.value)
  console.log(typeof val)
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

    // TRANSPARENCY SLIDER
    cell = tr.insertCell(-1)

    let div = document.createElement('div')
    div.className = 'showDiv'

    let div1 = document.createElement('div')
    div1.className = 'showHover'

    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-adjust')
    fas.style.cursor = 'pointer'
    div.appendChild(fas)

    let range = document.createElement('input')
    range.type = 'range'
    range.id = makeId(5, 'range')
    range.min = '0'
    range.max = '100'
    range.step = '1'

    rangeValue(range, opacities[ind])

    div1.appendChild(range)

    div.appendChild(div1)
    cell.appendChild(div)

    // PALETTE COLOR FUNCTION
    cell = tr.insertCell(-1)
    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-palette')
    fas.id = makeId(5, 'palette')
    fas.style.cursor = 'pointer'
    cell.appendChild(fas)
    let widget = filters(viewer, colorRanges, fas)
    fas.addEventListener('click', function (e) {
      widget.style.display = 'block'
    })
  })
}

// DRAGGABLE LAYERS (previously in tabs, now list)
let handleDragLayers = function (viewer) {

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
    console.log('e.target.id', e.target.id)
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
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
          layerTab.classList.remove('highlight')
          layerTab.classList.add('highlight')
          break
        }
      }

      // VIEWER
      let targetViewer = getViewerObject(closestViewer)
      let layerNum = movedElemId[0] // 1st char is array index
      console.log('layerNum', layerNum)
      layerNum = parseInt(layerNum) + 1 // (bc 0 = base)
      targetViewer.world.getItemAt(layerNum).setOpacity(1)
      // TODO: Do we want to make it a "move" or a "copy"?
      // sourceViewer.world.getItemAt(layerNum).setOpacity(0)
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

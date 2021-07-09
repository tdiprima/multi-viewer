let layers = function (divName, itemsToBeDisplayed, viewer) {
  createLayerWidget(document.getElementById(divName), itemsToBeDisplayed, viewer)
  handleDragLayers(viewer)
}

let eyeball = function (eye, range, layerNum, viewer) {
  let l = viewer.world.getItemAt(layerNum)
  if (l) {
    if (eye.classList.contains('fa-eye-slash')) {
      l.setOpacity(0) // Turn off layer
      range.value = '0' // Set slider to 0
    } else {
      l.setOpacity(1) // Turn on layer
      range.value = '100' // Set slider to (opacity * 100)
    }
  }
}

let createLayerWidget = function (div, itemsToBeDisplayed, viewer) {
  const regex = /\b[a-zA-Z0-9]{2}-[a-zA-Z0-9]{4}\b/gm
  const table = document.createElement('table')
  div.appendChild(table)

  itemsToBeDisplayed.forEach(function (layer, ind) {
    let layerNum = ind
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

    // fetch(layer.location)
    //   .then(response => response.json())
    //   .then(d => span.innerHTML = d.prefLabel ? d.prefLabel : getStringRep(layer.location))

    fetch(layer.location)
      .then(response => response.json())
      .then(function (d) {
        let loc = layer.location
        if (d.prefLabel) {
          span.innerHTML = d.prefLabel
        } else if (loc.includes('HalcyonStorage') && loc.includes('TCGA')) {
          span.innerHTML = loc.substring(loc.indexOf('HalcyonStorage') + 15, loc.indexOf('TCGA') - 1)
        } else if (loc.includes('TCGA')) {
          if (loc.match(regex) !== null)
            span.innerHTML = loc.match(regex)[0]
          else
            span.innerHTML = getStringRep(loc)
        } else {
          span.innerHTML = getStringRep(loc)
        }
      })

    cell.appendChild(span)

    // EYEBALL VISIBILITY TOGGLE
    cell = tr.insertCell(-1)
    eye = document.createElement('i')
    eye.classList.add('fas')
    if (layer.opacity === 0)
      eye.classList.add('fa-eye-slash')
    else
      eye.classList.add('fa-eye')
    // eyeball(eye, layerNum, viewer) // viewer.world... undefined here.

    eye.id = makeId(5, 'eye')
    cell.appendChild(eye)

    // TRANSPARENCY SLIDER
    cell = tr.insertCell(-1)

    let div = document.createElement('div')
    div.className = 'showDiv'

    let div1 = document.createElement('div')
    div1.className = 'showHover'

    fas = document.createElement('i')
    fas.classList.add('fas')
    fas.classList.add('fa-adjust')
    fas.classList.add('hover-orange')
    fas.style.cursor = 'pointer'
    div.appendChild(fas)

    let range = document.createElement('input')
    range.type = 'range'
    range.id = makeId(5, 'range')
    range.min = '0'
    range.max = '100'
    range.step = '0.1'
    range.value = (layer.opacity * 100).toString()

    // RANGE EVENT LISTENER
    range.addEventListener('input', function () {
      const worldItem = viewer.world.getItemAt(layerNum)
      if (worldItem !== undefined) {
        // SET IMAGE OPACITY
        worldItem.setOpacity(this.value / 100)
        // TOGGLE EYEBALL
        if (this.value === '0') {
          eye.classList.remove('fa-eye')
          eye.classList.add('fa-eye-slash')
        }
        if (parseFloat(this.value) > 0) {
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
        }
      } else {
        console.warn('worldItem', worldItem)
      }
    })

    // EYEBALL EVENT LISTENER
    eye.addEventListener('click', function () {
      toggleButton(eye, 'fa-eye', 'fa-eye-slash')
      eyeball(eye, range, layerNum, viewer)
    })

    div1.appendChild(range)

    div.appendChild(div1)
    cell.appendChild(div)

    // PALETTE COLOR FUNCTION
    cell = tr.insertCell(-1)
    // Color function for all layers except base
    if (layerNum > 0) {
      fas = document.createElement('i')
      fas.classList.add('fas')
      fas.classList.add('fa-palette')
      fas.id = makeId(5, 'palette')
      fas.style.cursor = 'pointer'
      cell.appendChild(fas)
      let colorsUI = filters(fas, layer, itemsToBeDisplayed, viewer)
      fas.addEventListener('click', function (e) {
        colorsUI.style.display = 'block'
      })
    }
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
      layerNum = parseInt(layerNum)
      targetViewer.world.getItemAt(layerNum).setOpacity(1)
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

/**
 * FEATURE ELEMENTS NAMING CONVENTION
 * 0featXXX <- 0th feature
 * <ETC>
 */
let layers = function (divEl, itemsToBeDisplayed, viewer) {
  createLayerWidget(divEl, itemsToBeDisplayed, viewer)
  handleDragLayers(itemsToBeDisplayed)
}

function getLabel(feat, layer) {
  return new Promise((resolve, reject) => {
    const loc = layer.location
    const regex = /\b[a-zA-Z0-9]{2}-[a-zA-Z0-9]{4}\b/gm
    let retVal = ''
    if (typeof layer.prefLabel !== 'undefined') {
      retVal = layer.prefLabel
    } else if (loc.includes('HalcyonStorage') && loc.includes('TCGA')) {
      retVal = loc.substring(loc.indexOf('HalcyonStorage') + 15, loc.indexOf('TCGA') - 1)
    } else if (loc.includes('TCGA')) {
      if (loc.match(regex) !== null) {
        retVal = loc.match(regex)[0]
      } else {
        retVal = getStringRep(loc)
      }
    } else {
      retVal = 'Feature'
    }
    resolve(retVal)
  })
}

function getSourceViewer(target) {
  // Go find the source viewer
  let layers_and_colors = target.parentElement.parentElement.parentElement.parentElement
  let tr = layers_and_colors.parentElement.parentElement
  let sourceViewerDiv = tr.firstElementChild.firstElementChild
  return getViewerObject(sourceViewerDiv)
}

function getViewerObject(element) {
  let retVal
  try {
    // syncedImageViewers = global variable set in synchronizeViewers.js
    for (let j = 0; j < syncedImageViewers.length; j++) {
      if (syncedImageViewers[j].getViewer().id === element.id) {
        retVal = syncedImageViewers[j].getViewer()
        break
      }
    }
  } catch (e) {
    console.error(`%cgetViewerObject: ${e.message}`, 'font-size: larger;')
  }
  return retVal
}

function addRow(table, currentLayer, allLayers, viewer) {
  let layerNum = currentLayer.layerNum

  let tr = e('tr')
  table.appendChild(tr)

  // Feature (draggable)
  let feat = e('span', {
    id: `${layerNum}${makeId(5, 'feat')}`,
    class: 'dragIt',
    display: 'block',
    draggable: 'true'
  })

  getLabel(feat, currentLayer).then(result => {
    feat.innerHTML = result
    if (typeof currentLayer.prefLabel === 'undefined') {
      currentLayer.prefLabel = feat.innerHTML
      allLayers[currentLayer.layerNum].prefLabel = feat.innerHTML
      // todo: prefLabel is set, but it's not set #:(
      // console.log('currentLayer', currentLayer)
      // console.log('PF', currentLayer.prefLabel)
      // console.log('typeof', typeof currentLayer)
    }
  })

  tr.appendChild(e('td', {}, [feat]))
  // console.log('currentLayer', currentLayer)

  // eyeball visibility toggle
  let faEye = e('i', {id: makeId(5, 'eye'), class: currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'})
  tr.appendChild(e('td', {}, [faEye]))

  // transparency slider
  let faAdjust = document.createElement('i')
  faAdjust.classList.add('fas')
  faAdjust.classList.add('fa-adjust')
  faAdjust.classList.add('hover-light')
  faAdjust.style.cursor = 'pointer'
  let div = e('div', {class: 'showDiv'}, [faAdjust])

  let range = e('input', {
    type: 'range',
    id: makeId(5, 'range'),
    min: '0',
    max: '100',
    step: '0.1',
    value: (currentLayer.opacity * 100).toString()
  })

  range.addEventListener('input', function () {
    let worldItem = viewer.world.getItemAt(layerNum)
    if (worldItem !== undefined) {
      worldItem.setOpacity(this.value / 100)
      if (this.value === '0') {
        faEye.classList.remove('fa-eye')
        faEye.classList.add('fa-eye-slash')
      }
      if (parseFloat(this.value) > 0) {
        faEye.classList.remove('fa-eye-slash')
        faEye.classList.add('fa-eye')
      }
    } else {
      console.warn('worldItem', worldItem)
    }
  })

  faEye.addEventListener('click', function () {
    toggleButton(faEye, 'fa-eye', 'fa-eye-slash')
    eyeball(faEye, range, layerNum, viewer)
  })

  div.appendChild(e('div', {class: 'showHover'}, [range]))
  tr.appendChild(e('td', {}, [div]))

  if (layerNum > 0) {
    let palette = e('i', {class: 'fas fa-palette pointer', id: makeId(5, 'palette')})
    tr.appendChild(e('td', {}, [palette]))
    let colorsUI = filters(palette, currentLayer.prefLabel, currentLayer.colors, allLayers, viewer)
    palette.addEventListener('click', function () {
      colorsUI.style.display = 'block'
    })
  } else {
    tr.appendChild(e('td'))
  }
}

function createLayerWidget(div, layers, viewer) {
  let table = e('table')
  div.appendChild(table)
  layers.forEach(function (layer) {
    addRow(table, layer, layers, viewer)
  })
}

// VIEWER'S DRAGGABLE LAYERS
function handleDragLayers(layers) {
  // todo: fix multiple execution

  // Features in feature list
  let features = document.querySelectorAll('.dragIt')
  features.forEach(function (feature) {
    feature.setAttribute('draggable', 'true')
    feature.addEventListener('dragstart', handleDragStart)
    feature.addEventListener('dragend', handleDragEnd)
  })

  // Div containing viewer
  let viewerDivs = document.querySelectorAll('.dropzone')
  viewerDivs.forEach(function (viewerDiv) {
    viewerDiv.addEventListener('dragenter', function () { this.classList.add('over') })
    viewerDiv.addEventListener('dragleave', function () { this.classList.remove('over') })
    viewerDiv.addEventListener('dragover', function (evt) { if (evt.preventDefault) evt.preventDefault(); return false })
    viewerDiv.addEventListener('drop', handleDrop)
    console.log('ADD DROP')
  })

  function handleDragStart(evt) {
    dragSrcEl = this // The draggable feature
    this.style.opacity = '0.4'
    sourceViewer = getSourceViewer(evt.target)
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('text', evt.target.id)
  }

  function handleDragEnd() {
    // this = the draggable feature
    this.style.opacity = '1'
    viewerDivs.forEach(function (viewerDiv) {
      viewerDiv.classList.remove('over')
    })
  }

  // todo: handleDrop executing more than once per drop?
  function handleDrop(evt) {
    // this = dropzone viewer
    if (evt.preventDefault) evt.preventDefault()

    if (dragSrcEl !== this) {
      // target
      let target = evt.target // fabric upper-canvas
      let targetDiv = target.closest('.viewer') // returns the real target
      if (!targetDiv) return false;

      let layersColumn = targetDiv.parentElement.nextSibling.firstChild
      let myTable = layersColumn.firstChild
      // console.log('myTable', myTable)

      let movedElemId = evt.dataTransfer.getData('text')
      let movedElem = document.getElementById(movedElemId)
      let name = movedElem.innerHTML

      let layNum
      let foundMatchingSlide = false
      for (let row of myTable.rows) {
        let lay = row.cells[0].firstChild
        layNum = lay.id[0] // 1st char is array index)
        // console.log('inner H', lay.innerHTML)
        let eye = row.cells[1].children[0]
        if (lay.innerHTML === name) {
          // console.log('match')
          foundMatchingSlide = true
          // Highlight the layer
          lay.classList.remove('highlight') // just in case.
          lay.classList.add('highlight')
          // Toggle eyeball
          eye.classList.remove('fa-eye-slash')
          eye.classList.add('fa-eye')
          break
        }
      }

      let targetViewer = getViewerObject(targetDiv)
      if (foundMatchingSlide) {
        console.log('%cFound layer', 'color: lime;')
        try {
          targetViewer.world.getItemAt(layNum).setOpacity(1) // show
          // sourceViewer.world.getItemAt(XXX).setOpacity(0) // hide
        } catch (e) {
          console.log('It may get here if the handler executes twice on one drop:')
          console.log(`%c${e.message}`, 'color: #ff6a5a;')
        }
      } else {
        console.log('%cAdding a layer', 'color: deeppink;')
        const location = sourceViewer.tileSources[layNum].tileSource
        const newLayNum = layers.length
        // New draggable feature
        let feat = e('span', {
          id: `${newLayNum}${makeId(5, 'feat')}`,
          class: 'dragIt',
          display: 'block',
          draggable: 'true'
        })
        feat.innerHTML = name

        let addToLayers = {
          "layerNum": layers.length,
          "location": location,
          "opacity": 1,
          "colors": [
            {
              // "color": "rgba(75, 0, 130, 255)",
              "color": "rgba(184, 226, 242, 255)",
              "low": 128,
              "hi": 255
            }
          ],
          "resolutionUnit": 3,
          "xResolution": 40000
        }
        // append new value to the array
        addToLayers.prefLabel = getLabel(feat, addToLayers)
        layers.push(addToLayers)

        addRow(myTable, addToLayers, layers, targetViewer)

        // let row = myTable.insertRow()
        // let cell1 = row.insertCell(0)
        // cell1.appendChild(feat)
        // let cell2 = row.insertCell(1)
        // cell1.innerHTML = name
        // cell1.className = 'dragIt'
        // cell2.innerHTML = "NEW CELL2"

        targetViewer.addTiledImage({tileSource: location, opacity: 1, x: 0, y: 0})

      }
    }
    return false
  }
}

function eyeball(eye, range, layerNum, viewer) {
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

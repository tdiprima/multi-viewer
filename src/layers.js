/**
 * There's a column called "layers_and_colors" to the right of each viewer.
 * Create an HTML table there, with each row corresponding to each layer displayed in viewer.
 * Each layer has:
 *     a draggable item: the layer
 *         naming convention: 0featXXX <- 0th feature
 *     an eyeball: turn layer on & off
 *     a slider: adjust transparency
 *     a color palette: change colors in layer
 *     broadcast tower: attenuate by certainty
 */
let layers = (divEl, images, viewer) => {
  createLayerWidget(divEl, images, viewer)
  handleDragLayers(images, viewer)
}

/**
 * Locate the source viewer
 */
function getSourceViewer(focusButton) {
  // Find the layers_and_colors div close to where the user dropped the feature:
  let layers_and_colors = focusButton.parentElement.parentElement.parentElement.parentElement
  // Get the table row containing the viewer
  let tr = layers_and_colors.parentElement.parentElement
  // Finally, get the source viewer's div
  let sourceViewerDiv = tr.firstElementChild.firstElementChild
  return getViewerObject(sourceViewerDiv)
}

/**
 * Given the div containing the viewer, get the corresponding OpenSeadragonViewer object
 */
function getViewerObject(element) {
  let retVal
  try {
    // syncedImageViewers = global variable set in synchronizeViewers.js
    for (let nsync of syncedImageViewers) {
      if (nsync.getViewer().id === element.id) {
        retVal = nsync.getViewer()
        break
      }
    }
  } catch (e) {
    console.error(e.message)
  }
  return retVal
}

/**
 * One row per layer
 */
function addRow(table, currentLayer, allLayers, viewer) {
//function addRow(m_div, currentLayer, allLayers, viewer) {
  // todo: swap
  const layerNum = currentLayer.layerNum
  //'class': 'b-controls'
  //let childDiv = e('div', {'style': 'display: inline-block'}, [])
  //let childDiv = e('div')
  //m_div.appendChild(childDiv)

  let tr = e('tr')
  table.appendChild(tr)

  // Preferred Label
  const sections = (currentLayer.location).split('/')
  const name = sections[sections.length - 2] // filename

  // Feature (draggable)
  let feat = e('button', {
    'id': `${layerNum}${makeId(5, 'feat')}`,
    'class': 'dragIt b-controls',
    'style': 'display: inline-block',
    'draggable': 'true',
    'data-tooltip': name
  })
  feat.innerHTML = name

  /**
   * One column per icon
   */
  tr.appendChild(e('td', {}, [feat]))
  //childDiv.appendChild(feat)

  // eyeball visibility toggle
  let cssClass = currentLayer.opacity === 0 ? 'fas fa-eye-slash' : 'fas fa-eye'
  let faEye = e('i', {'id': makeId(5, 'eye'), 'class': `${cssClass} hover-light b-controls`, 'title': 'toggle visibility'})
  tr.appendChild(e('td', {}, [faEye]))
  //childDiv.appendChild(faEye)

  // transparency slider
  let faAdjust = document.createElement('i')
  faAdjust.classList.add('fas')
  faAdjust.classList.add('fa-adjust')
  faAdjust.classList.add('hover-light')
  faAdjust.style.cursor = 'pointer'
  let div = e('div', {class: 'showDiv b-controls', 'title': 'transparency slider'}, [faAdjust])

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

  faEye.addEventListener('click', () => {
    toggleButton(faEye, 'fa-eye', 'fa-eye-slash')
    eyeball(faEye, range, layerNum, viewer)
  })

  div.appendChild(e('div', {class: 'showHover b-controls'}, [range]))
  tr.appendChild(e('td', {}, [div]))
  //childDiv.appendChild(div)

  if (layerNum > 0) {
    // color palette
    let palette = e('i', {
      'id': makeId(5, 'palette'),
      'class': 'fas fa-palette hover-light b-controls',
      'title': 'color palette'
    })
    tr.appendChild(e('td', {}, [palette]))
    //childDiv.appendChild(palette)

    // TODO: when we get prefLabel, then we can pass currentLayer.prefLabel instead of feat.innerText
    let colorsUI = filters(palette, feat.innerText, currentLayer.colorscheme, allLayers, viewer)
    palette.addEventListener('click', () => {
      colorsUI.style.display = 'block'
    })

    // color-attenuation by probability
    let attenuation = e('i', {
      'id': makeId(5, 'atten'),
      'class': 'fas fa-broadcast-tower hover-light b-controls',
      'title': 'toggle: color-attenuation by probability'
    })
    tr.appendChild(e('td', {}, [attenuation]))
    //childDiv.appendChild(attenuation)

    attenuation.addEventListener('click', () => {
      attenuateFlag = !attenuateFlag
      outlineFlag = false
      setFilter(allLayers, viewer)
    })

    // probability off/on
    let probability = e('i', {
      'id': makeId(5, 'prob'),
      'class': 'fas fa-shapes hover-light b-controls',
      'title': 'toggle: class / probability'
    })
    tr.appendChild(e('td', {}, [probability]))
    //childDiv.appendChild(probability)

    probability.addEventListener('click', () => {
      let pi = colorsUI.id.replace('filters', '')
      if (renderType === 'byClass') {
        renderType = 'byProbability'
        document.getElementById(`divA${pi}`).style.display = 'none'
        document.getElementById(`divB${pi}`).style.display = 'block'
      } else {
        renderType = 'byClass'
        document.getElementById(`divA${pi}`).style.display = 'block'
        document.getElementById(`divB${pi}`).style.display = 'none'
      }
      outlineFlag = false
      toggleButton(probability, 'fa-shapes', 'fa-dice')
      setFilter(allLayers, viewer)
    })

    // heatmap off/on
    let heatmap = e('i', {
      'id': makeId(5, 'prob'),
      'class': 'far fa-map hover-light b-controls',
      'title': 'blue-red heatmap'
    })
    tr.appendChild(e('td', {}, [heatmap]))
    //childDiv.appendChild(heatmap)

    heatmap.addEventListener('click', () => {
      if (renderType === 'byHeatmap') {
        if (probability.classList.contains('fa-shapes')) {
          renderType = 'byClass'
        }
        if (probability.classList.contains('fa-dice')) {
          renderType = 'byProbability'
        }
      } else {
        renderType = 'byHeatmap'
      }
      outlineFlag = false

      setFilter(allLayers, viewer)
    })

    // Toggle fill polygon
    let emptyCircle = "far"
    let filledCircle = "fas"
    let fillPoly = e('i', {
      'id': makeId(5, 'fillPoly'),
      'class': `${filledCircle} fa-circle hover-light b-controls`,
      'title': 'fill unfill'
    });
    tr.appendChild(e('td', {}, [fillPoly]))
    //childDiv.appendChild(fillPoly)

    fillPoly.addEventListener('click', () => {
      outlineFlag = !outlineFlag
      toggleButton(fillPoly, filledCircle, emptyCircle)
      setFilter(allLayers, viewer)
    })

  }
  else {
    tr.appendChild(e('td'))
  }
}

function createLayerWidget(div, layers, viewer) {
  // todo: swap
  let table = e('table')
  div.appendChild(table)
  layers.forEach(layer => {
    addRow(table, layer, layers, viewer)
    //addRow(div, layer, layers, viewer)
  })
}

// VIEWER'S DRAGGABLE LAYERS
function handleDragLayers(layers, viewer) {
  // Div containing viewer
  let dropzone = document.getElementById(viewer.id)
  dropzone.addEventListener('dragenter', function () {
    this.classList.add('over')
  })
  dropzone.addEventListener('dragleave', function () {
    this.classList.remove('over')
  })
  dropzone.addEventListener('dragover', evt => {
    if (evt.preventDefault) evt.preventDefault();
    return false
  })
  dropzone.addEventListener('drop', handleDrop)

  let table = dropzone.parentElement.parentElement.parentElement.parentElement
  // The features/layers to the right of the viewer
  let features = table.querySelectorAll('.dragIt')
  features.forEach(feature => {
    feature.setAttribute('draggable', 'true')
    feature.addEventListener('dragstart', handleDragStart)
    feature.addEventListener('dragend', handleDragEnd)
  })

  function handleDragStart(evt) {
    dragSrcEl = this // The draggable feature (button element)
    this.style.opacity = '0.4'
    sourceViewer = getSourceViewer(evt.target)
    evt.dataTransfer.effectAllowed = 'move'
    evt.dataTransfer.setData('text', evt.target.id)
  }

  function handleDragEnd() {
    // this = the draggable feature
    this.style.opacity = '1'
    dropzone.classList.remove('over')
  }

  function handleDrop(evt) {
    // this = dropzone viewer
    this.classList.remove('over')

    if (evt.preventDefault) evt.preventDefault()

    // Make sure user didn't drop the button on its own viewer div
    if (dragSrcEl !== this) {
      // target
      let target = evt.target // canvas upper-canvas
      let targetDiv = target.closest('.viewer') // where they dropped the feature
      if (!targetDiv) return false;
      // Find matching layers_and_colors div
      const td1 = targetDiv.parentElement
      const td2 = td1.nextSibling
      // Find the corresponding table (we will add this feature here)
      let myTable = td2.firstChild

      let movedElemId = evt.dataTransfer.getData('text')
      let movedElem = document.getElementById(movedElemId)
      let name = movedElem.innerHTML

      let layNum
      let foundMatchingSlide = false
      for (let row of myTable.rows) {
        let lay = row.cells[0].firstChild
        layNum = lay.id[0] // 1st char is array index
        let eye = row.cells[1].children[0]
        if (lay.innerHTML === name) {
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
        try {
          targetViewer.world.getItemAt(layNum).setOpacity(1) // show
          // sourceViewer.world.getItemAt(XXX).setOpacity(0) // hide
        } catch (e) {
          console.warn('It may get here if the handler executes twice on one drop:')
          console.warn(e.message)
        }
      } else {
        console.error('Did not find matching slide')
        const location = sourceViewer.tileSources[layNum].tileSource
        console.error('src img', location)
        const newLayNum = layers.length
        // New draggable feature
        let feat = e('span', {
          id: `${newLayNum}${makeId(5, 'feat')}`,
          class: 'dragIt',
          display: 'block',
          draggable: 'true'
        })
        feat.innerHTML = name

        // TODO: this part needs to change
        let addToLayers = {
          "layerNum": layers.length,
          "location": location,
          "opacity": 1,
          "colors": [
            {
              // "color": "rgba(75, 0, 130, 255)",
              "color": "rgba(184, 226, 242, 255)",
              "low": 128,
              "high": 255
            }
          ],
          "resolutionUnit": 3,
          "xResolution": 40000,
          "prefLabel": 'something'  // TODO: getLabel(feat, addToLayers)
        }
        // append new value to the array
        // addToLayers.prefLabel = getLabel(feat, addToLayers)
        layers.push(addToLayers)

        addRow(myTable, addToLayers, layers, targetViewer)

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

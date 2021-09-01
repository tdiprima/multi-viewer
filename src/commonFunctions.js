function setFilter(layers, viewer) {
  if (viewer.world) {
    // SET COLOR FILTER
    let itemCount = viewer.world.getItemCount()
    let filterOpts = []
    // Gather what we're doing for each layer
    for (let i = 0; i < itemCount; i++) {
      if (i > 0 && typeof layers[i].colors !== 'undefined') {
        filterOpts.push({
          items: viewer.world.getItemAt(i),
          processors: [
            colorFilter.prototype.COLORLEVELS(layers[i].colors)
          ]
        })
      }
    }
    // Set all layers at once (required)
    viewer.setFilterOptions({
      filters: filterOpts,
      loadMode: 'sync'
    })
  }
}

function setOsdMove(viewer, myBool) {
  viewer.setMouseNavEnabled(myBool)
  viewer.outerTracker.setTracking(myBool)
  viewer.gestureSettingsMouse.clickToZoom = myBool
}

function toggleButton(element, class0, class1) {
  element.classList.toggle(class0)
  element.classList.toggle(class1)
}

function isRealValue(obj) {
  return obj && obj !== 'null' && obj !== 'undefined'
}

const isEmpty = function (value) {
  const isEmptyObject = function (a) {
    if (typeof a.length === 'undefined') { // it's an Object, not an Array
      const hasNonempty = Object.keys(a).some(function nonEmpty(element) {
        return !isEmpty(a[element])
      })
      return hasNonempty ? false : isEmptyObject(Object.keys(a))
    }

    return !a.some(function nonEmpty(element) { // check if array is really not empty as JS thinks
      return !isEmpty(element) // at least one element should be non-empty
    })
  }
  return (
    value === false || typeof value === 'undefined' || value === null || (typeof value === 'object' && isEmptyObject(value))
  )
}

function getAColorThatShowsUp(strokeColor) {
  function isBlueIsh() {
    return strokeColor.endsWith('ff')
  }

  function isCyanOrMagenta() {
    return strokeColor === '#00ffff' || strokeColor === '#ff00ff'
  }

  if (isBlueIsh() && !isCyanOrMagenta()) {
    return 'rgba(255, 255, 0, 0.5)' // yellow
  } else {
    return 'rgba(0, 0, 255, 0.5)' // blue (default)
  }
}

function alertMessage(messageObject) {
  window.alert(messageObject)
  return true
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio)
  }
}

function getRandomInt(minm, maxm) {
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm
}

function makeId(length, prefix) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let i
  for (i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  if (prefix) {
    result = prefix + result
  }
  return result
}

// Standard replacement for Java's String.hashCode()
String.prototype.hashCode = function () {
  let hash = 0
  if (this.length === 0) return hash
  let i, char
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

function getStringRep(_input) {
  let _md5 = _input.hashCode()
  if (_md5 < 0) {
    _md5 *= -1
  }
  const _text = _md5.toString(16)
  return _text.toUpperCase()
}

// async function
async function fetchAsync(url) {
  const response = await fetch(url) // await response of fetch call
  const data = await response.json() // only proceed once promise is resolved
  return data // only proceed once second promise is resolved
}

// Item name is unique
// fabric.Canvas.prototype.getItemByName = function (name) {
//   let object = null
//   const objects = this.getObjects()
//
//   for (let i = 0, len = this.size(); i < len; i++) {
//     if (objects[i].name && objects[i].name === name) {
//       object = objects[i]
//       break
//     }
//   }
//
//   return object
// }
// Item name is non-unique
fabric.Canvas.prototype.getItemsByName = function (name) {
  const objectList = []
  const objects = this.getObjects()

  for (let i = 0, len = this.size(); i < len; i++) {
    if (objects[i].name && objects[i].name === name) {
      objectList.push(objects[i])
    }
  }

  return objectList
}

// element creation abstraction
const e = (name, properties = {}, children = []) => {
  // Create the element
  const element = document.createElement(name)

  // Apply properties
  Object.keys(properties).forEach(property => {
    element.setAttribute(property, properties[property])
  })

  // Append children
  children.forEach(c => {
    if (!c) return
    const node = (typeof c === 'string') ? document.createTextNode(c) : c
    element.appendChild(node)
  })

  return element
}

// github scijs/almost-equal
const abs = Math.abs
const min = Math.min

function almostEqual(a, b, absoluteError, relativeError) {
  const d = abs(a - b)
  if (absoluteError == null) absoluteError = almostEqual.DBL_EPSILON
  if (relativeError == null) relativeError = absoluteError
  if (d <= absoluteError) {
    return true
  }
  if (d <= relativeError * min(abs(a), abs(b))) {
    return true
  }
  return a === b
}

almostEqual.DBL_EPSILON = 2.2204460492503131e-16

function colorToArray(input) {
  return input.replace(/[a-z%\s()]/g, '').split(',')
}

function parseHash() {
  let params = {}
  let hash = window.location.hash.replace(/^#/, '')
  if (hash) {
    let parts = hash.split('&')
    parts.forEach(function (part) {
      let subparts = part.split('=')
      let key = subparts[0]
      let value = parseFloat(subparts[1])
      if (!key || isNaN(value)) {
        console.error('bad hash param', part)
      } else {
        params[key] = value
      }
    })
  }

  return params
}

function timeStamp() {
  let dateString = new Date().toISOString()
  let a = dateString.slice(0, 10)
  let b = dateString.slice(10)
  b = b.replaceAll(':', '-').replace('T', '').slice(0, 8)
  return `${a}_${b}`
}

let PDR = OpenSeadragon.pixelDensityRatio
let pix_per_micron = 4 // default; actual value set later
let microns_per_pix = 0.25 // ditto

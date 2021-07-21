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

function parseColor(input) {
  let m
  m = input.match(/^#([0-9a-f]{3})$/i) // 3-char format
  if (m) {
    m = m[1]
    return [
      parseInt(m.charAt(0), 16) * 0x11,
      parseInt(m.charAt(1), 16) * 0x11,
      parseInt(m.charAt(2), 16) * 0x11
    ]
  }
  m = input.match(/^#([0-9a-f]{6})$/i) // 6-char format
  if (m) {
    m = m[1]
    return [
      parseInt(m.substr(0, 2), 16),
      parseInt(m.substr(2, 2), 16),
      parseInt(m.substr(4, 2), 16)
    ]
  }
  m = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i) // rgb
  if (m) {
    return [m[1], m[2], m[3]]
  }

  m = input.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i) // rgba
  if (m) {
    return [m[1], m[2], m[3], m[4]]
  }
}

function arraysEqual(a1, a2) {
  // Arrays must not contain {...} or behavior may be undefined
  return JSON.stringify(a1) === JSON.stringify(a2);
}

function clearClassList (element) {
  const classList = element.classList
  while (classList.length > 0) {
    classList.remove(classList.item(0))
  }
}

// eslint-disable-next-line no-unused-vars
function toggleButtonHighlight (btn) {
  const isOn = btn.classList.contains('btnOn')
  clearClassList(btn)
  if (isOn) {
    btn.classList.add('btn')
  } else {
    btn.classList.add('btnOn')
  }
}

// eslint-disable-next-line no-unused-vars
function isRealValue (obj) {
  return obj && obj !== 'null' && obj !== 'undefined'
}

// eslint-disable-next-line no-unused-vars
const isEmpty = function (value) {
  const isEmptyObject = function (a) {
    if (typeof a.length === 'undefined') { // it's an Object, not an Array
      const hasNonempty = Object.keys(a).some(function nonEmpty (element) {
        return !isEmpty(a[element])
      })
      return hasNonempty ? false : isEmptyObject(Object.keys(a))
    }

    return !a.some(function nonEmpty (element) { // check if array is really not empty as JS thinks
      return !isEmpty(element) // at least one element should be non-empty
    })
  }
  return (
    value === false || typeof value === 'undefined' || value === null || (typeof value === 'object' && isEmptyObject(value))
  )
}
// TODO: Uncomment while testing:
module.exports = isEmpty;

// eslint-disable-next-line no-unused-vars
function getAColorThatShowsUp (strokeColor) {
  function isBlueIsh () {
    return strokeColor.endsWith('ff')
  }

  function isCyanOrMagenta () {
    return strokeColor === '#00ffff' || strokeColor === '#ff00ff'
  }

  if (isBlueIsh() && !isCyanOrMagenta()) {
    return 'rgba(255, 255, 0, 0.5)' // yellow
  } else {
    return 'rgba(0, 0, 255, 0.5)' // blue (default)
  }
}

// eslint-disable-next-line no-unused-vars
function alertMessage (messageObject) {
  alert(messageObject) // eslint-disable-line no-undef
  return true
}

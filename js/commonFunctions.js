function clearClassList (element) {
  const classList = element.classList
  while (classList.length > 0) {
    classList.remove(classList.item(0))
  }
}

function toggleButtonHighlight (btn) {
  const isOn = btn.classList.contains('btnOn')
  clearClassList(btn)
  if (isOn) {
    btn.classList.add('btn')
  } else {
    btn.classList.add('btnOn')
  }
}

function isRealValue (obj) {
  return obj && obj !== 'null' && obj !== 'undefined'
}

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

function alertMessage (messageObject) {
  alert(messageObject)
  return true
}

// Common functions

function clearClassList (element) {
  const classList = element.classList
  while (classList.length > 0) {
    classList.remove(classList.item(0))
  }
}

function toggleButton (btn) {
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

function getCornerColor (fabricObject) {
  let cornerColor
  const strokeColor = fabricObject.stroke
  if (strokeColor.endsWith('ff') && strokeColor !== '#00ffff' && strokeColor !== '#ff00ff') {
    // blue corners with blue paint won't show up
    cornerColor = 'rgba(255, 255, 0, 0.5)' // so put yellow
  } else {
    cornerColor = 'rgba(0, 0, 255, 0.5)' // default color for handles
  }
  return cornerColor
}

// To reduce the hit points from JSLint to 1 time.
// Ref: https://subscription.packtpub.com/book/web_development/9781849510004/3/ch03lvl1sec15/time-for-action-fixing-alert-is-not-defined
function alertMessage (messageObject) {
  alert(messageObject)
  return true
}

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

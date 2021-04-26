// Utilizes: https://github.com/taufik-nurrohman/color-picker
// Combination and customization of: color-picker.alpha-channel + color-picker.color + color-picker.events

const colorPicker = function (inputElement) {
  // Check
  if (inputElement === null || typeof inputElement === 'undefined') {
    throw Error('colorPicker.js: Expected input argument, but received none.')
  }
  // Construct
  const picker = new CP(inputElement)
  picker.on('change', function (r, g, b, a) {
    this.source.value = this.color(r, g, b, a)
    this.source.innerHTML = this.color(r, g, b, a)
    this.source.style.backgroundColor = this.color(r, g, b, a)
  })

  // Toggle by click event
  // Disable the default blur and focus behavior
  picker.on('blur', function () {})
  picker.on('focus', function () {})

  document.documentElement.addEventListener('click', function () {
    picker.exit()
  }, false)

  picker.source.addEventListener('click', function (e) {
    picker.enter()
    e.stopPropagation()
  }, false)

  // DEBUG
  // console.log('self:', picker.self)
  // console.log('source:', picker.source)
  // console.log('state:', picker.state)

  return picker
}

// In case we want to remove the alpha, keep code separate
function disableAlphaChannel (picker) {
  picker.self.classList.add('no-alpha')
  picker.on('change', function (r, g, b) {
    this.source.value = this.color(r, g, b, 1)
  })
}


// Attach custom color picker to toolbar
// colorPicker-picker repo: https://github.com/taufik-nurrohman/color-picker
function colorPicker (inputElement) {
  const picker = new CP(inputElement)
  picker.self.classList.add('no-alpha') // hide alpha control panel

  // Disable the default blur and focus behavior
  picker.on('blur', function () {
  })
  picker.on('focus', function () {
  })

  // Set color value and style
  picker.on('change', function (r, g, b) {
    this.source.value = this.color(r, g, b, 1)
    this.source.innerHTML = this.color(r, g, b, 1)
    this.source.style.backgroundColor = this.color(r, g, b, 1)
  })

  // Show and hide color picker panel with a click
  picker.source.addEventListener('click', function (e) {
    picker.enter()
    e.stopPropagation()
  }, false)

  document.documentElement.addEventListener('click', function () {
    picker.exit()
  }, false)
}

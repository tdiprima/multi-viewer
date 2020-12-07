// Utilizes: https://github.com/taufik-nurrohman/color-picker
// Combination and customization of: color-picker.alpha-channel + color-picker.color + color-picker.events

const colorPicker = function (inputElement) {
  const picker = new CP(inputElement)
  picker.self.classList.add('no-alpha')
  picker.on('change', function (r, g, b) {
    this.source.value = this.color(r, g, b, 1)
    this.source.innerHTML = this.color(r, g, b, 1)
    this.source.style.backgroundColor = this.color(r, g, b, 1)
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

  return picker
}

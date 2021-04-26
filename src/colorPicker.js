// Utilizes: https://github.com/taufik-nurrohman/color-picker
const colorPicker = function (inputElement) {
  // Check
  if (!isRealValue(inputElement)) {
    throw Error('colorPicker.js: Expected input argument, but received none.')
  }

  // Construct
  const picker = new CP(inputElement)
  picker.on('change', function (r, g, b, a) {
    this.source.value = this.color(r, g, b, a)
    this.source.innerHTML = this.color(r, g, b, a)
    this.source.style.backgroundColor = this.color(r, g, b, a)
  })

  return picker
}

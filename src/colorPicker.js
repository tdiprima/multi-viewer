// Utilizes: https://github.com/taufik-nurrohman/color-picker
const colorPicker = function (inputElement) {
  console.warn('colorPicker', inputElement)

  // Check
  if (!isRealValue(inputElement)) {
    console.error('HERE')
    throw Error('colorPicker.js: Expected input argument, but received none.')
  }

  // Construct
  const picker = new CP(inputElement)
  console.warn('CP', picker)
  picker.on('change', function (r, g, b, a) {
    try {
      console.warn('r, g, b, a', r, g, b, a)
      this.source.value = this.color(r, g, b, a)

      console.warn('this.source.value', this.source.value)
      this.source.innerHTML = this.color(r, g, b, a)

      console.warn('this.source.innerHTML', this.source.innerHTML)
      this.source.style.backgroundColor = this.color(r, g, b, a)
    }
    catch (err) {
      console.error('Caught!', err.message)
    }

  })

  return picker
}

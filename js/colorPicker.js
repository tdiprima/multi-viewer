// Utilizes: https://github.com/taufik-nurrohman/color-picker
// eslint-disable-next-line no-unused-vars
const colorPicker = function (inputElement) {
  const cp = create(inputElement)

  setColorAndStyle(cp)

  handleShowHide(cp)

  handleExit(cp)
}

function create (inputElement) {
  const cp = new CP(inputElement) // eslint-disable-line no-undef

  cp.self.classList.add('no-alpha')

  cp.on('blur', function () {
  })

  cp.on('focus', function () {
  })

  return cp
}

function setColorAndStyle (cp) {
  cp.on('change', function (r, g, b) {
    this.source.value = this.color(r, g, b, 1)
    this.source.innerHTML = this.color(r, g, b, 1)
    this.source.style.backgroundColor = this.color(r, g, b, 1)
  })
}

function handleShowHide (cp) {
  cp.source.addEventListener('click', function (e) {
    cp.enter()
    e.stopPropagation()
  }, false)
}

function handleExit (cp) {
  document.documentElement.addEventListener('click', function () {
    cp.exit()
  }, false)
}

// Uncomment line while testing:
// module.exports = colorPicker

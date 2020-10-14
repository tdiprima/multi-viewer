// Utilizes: https://github.com/taufik-nurrohman/color-picker
// eslint-disable-next-line no-unused-vars
const colorPicker = function (inputElement) {
  const cp = create(inputElement)

  setColorAndStyle(cp)

  handleShowHide(cp)

  handleExit(cp)

  return cp
}

function create (inputElement) {
  const picker = new CP(inputElement) // eslint-disable-line no-undef

  picker.self.classList.add('no-alpha')

  picker.on('blur', function () {
  })

  picker.on('focus', function () {
  })

  printInfo(picker)
  return picker
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

function printInfo (cp) {
  console.log('self:', cp.self)
  console.log('source:', cp.source)
  console.log('state:', cp.state)
}

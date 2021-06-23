let blender = function (button, viewer) {
  let blend_modes = [
    'normal',
    'difference', // reposition difference
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    // 'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity'
  ]
  let widgetCreated = false

  function createWidget(div, viewer) {
    const table = document.createElement('table')
    div.appendChild(table)
    blend_modes.forEach(function (item, index) {
      let tr = table.insertRow(-1)
      table.appendChild(tr)
      let td = tr.insertCell(-1)
      let el = document.createElement('button')
      el.type = 'button'
      el.id = item.replace('-', '_')
      el.value = item
      el.innerHTML = item
      el.classList.add('button')
      td.appendChild(el)
      td.appendChild(document.createElement('br'))
      el.addEventListener('click', function () {
        try {
          let count = viewer.world.getItemCount()
          let topImage = viewer.world.getItemAt(count - 1) // Blend all
          topImage.setCompositeOperation(el.value)
        } catch (e) {
          console.log(e.message)
        }
      })
    })
  }

  button.addEventListener('click', function () {
    if (widgetCreated) {
      // Turn off
      widgetCreated = false
    } else {
      // Turn on
      let id = makeId(5, 'modes')
      let rect = button.getBoundingClientRect()
      let div = createDraggableDiv(id, 'Blend Modes', rect.left, rect.top)
      div.style.display = 'block'
      createWidget(document.getElementById(`${id}Body`), viewer)
      widgetCreated = true
    }
    toggleButton(button, 'btnOn', 'btn')
  })
}

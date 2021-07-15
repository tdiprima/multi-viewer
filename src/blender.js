let blender = function (blenderBtn, viewer) {
  let blendModes = [
    'normal',
    'difference',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity'
  ]
  let uiCreated = false

  function createBlendModesUI(div, viewer) {
    const table = e('table')
    div.appendChild(table)

    blendModes.forEach(function (item, index) {
      let blendBtn = e('button', {type: 'button', id: item.replace('-', '_'), value: item, class: 'button'})
      blendBtn.innerHTML = item
      const row = e('tr', {}, [
        e('td', {}, [blendBtn, e('br')])
      ])
      table.appendChild(row)

      blendBtn.addEventListener('click', function () {
        try {
          let count = viewer.world.getItemCount()
          let topImage = viewer.world.getItemAt(count - 1) // Blend all
          topImage.setCompositeOperation(blendBtn.value)
        } catch (e) {
          console.log(e.message)
        }
      })
    })
  }

  blenderBtn.addEventListener('click', function () {
    if (uiCreated) {
      // Turn off
      uiCreated = false
    } else {
      // Turn on
      let id = makeId(5, 'modes')
      let rect = blenderBtn.getBoundingClientRect()
      let div = createDraggableDiv(id, 'Blend Modes', rect.left, rect.top)
      div.style.display = 'block'
      createBlendModesUI(document.getElementById(`${id}Body`), viewer)
      uiCreated = true
    }
    toggleButton(blenderBtn, 'btnOn', 'btn')
  })
}

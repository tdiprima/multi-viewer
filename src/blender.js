/**
 * Implementation of OpenSeadragon.TiledImage.setCompositeOperation
 * [uses CanvasRenderingContext2D.globalCompositeOperation]
 * to create different visual effects when applied to the layers.
 * Users can play with the different effects and see if it helps to
 * discover things from a new and different perspective.
 *
 * @param blenderBtn: clickable blender icon
 * @param viewer: OpenSeadragon viewer on which to apply the effects
 */
const blender = (blenderBtn, viewer) => {
  const blendModes = [
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

  // Set up user interface
  function createBlendModesUI(div, viewer) {
    const table = e('table')
    div.appendChild(table)

    blendModes.forEach(item => {
      const blendBtn = e('button', {
        'type': 'button',
        'id': item.replace('-', '_'),
        'value': item,
        'class': 'btn hover-light',
        'style': 'width: 120px'
      })
      blendBtn.innerHTML = item

      const row = e('tr', {}, [
        e('td', {}, [blendBtn, e('br')])
      ])
      table.appendChild(row)

      // User interface event handler
      blendBtn.addEventListener('click', () => {
        try {
          const count = viewer.world.getItemCount()
          const topImage = viewer.world.getItemAt(count - 1) // Blend all
          topImage.setCompositeOperation(blendBtn.value)
        } catch (e) {
          console.error(e.message)
        }
      })
    })
  }

  // onClick handler for blender icon
  blenderBtn.addEventListener('click', () => {
    if (uiCreated) {
      // Turn off
      uiCreated = false
    } else {
      // Turn on
      const id = makeId(5, 'modes')
      const rect = blenderBtn.getBoundingClientRect()
      const div = createDraggableDiv(id, 'Blend Modes', rect.left, rect.top)
      div.style.display = 'block'
      createBlendModesUI(document.getElementById(`${id}Body`), viewer)
      uiCreated = true
    }
    toggleButton(blenderBtn, 'btnOn', 'btn')
  })
}

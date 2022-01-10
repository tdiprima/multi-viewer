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
    ['normal', 'normal'],
    ['difference', 'The Difference blend mode subtracts the pixels of the base and blend layers and the result is the greater brightness value.'],
    ['multiply', 'The Multiply mode multiplies the colors of the blending layer and the base layers, resulting in a darker color.'],
    ['screen','With Screen blend mode, the values of the pixels in the layers are inverted, multiplied, and then inverted again. The result is the opposite of Multiply: wherever either layer was darker than white, the composite is brighter.'],
    ['overlay', 'The Overlay blend mode both multiplies dark areas and screens light areas at the same time, so dark areas become darker and light areas become lighter.'],
    ['darken', 'The Darken blending mode does not blend pixels; it only compares the layers and keeps the darkest.'],
    ['lighten', 'The Lighten blending mode takes a look at the layers, and it keeps whichever is lightest.'],
    ['color-dodge', 'The Color Dodge blend mode divides the bottom layer by the inverted top layer.'],
    ['color-burn', 'The Color Burn Blending Mode gives you a darker result than Multiply by increasing the contrast between the base and the blend colors resulting in more highly saturated mid-tones and reduced highlights.'],
    ['hard-light', 'Hard Light combines the Multiply and Screen Blending Modes using the brightness values of the Blend layer to make its calculations. The results with Hard Light tend to be intense.'],
    ['soft-light', 'With the Soft Light blending mode, every color that is lighter than 50% grey will get even lighter, like it would if you shine a soft spotlight to it. In the same way, every color darker than 50% grey will get even darker.'],
    ['exclusion', 'Exclusion is very similar to Difference. Blending with white inverts the base color values, while blending with black produces no change. However, Blending with 50% gray produces 50% gray.'],
    ['hue', 'The Hue Blending Mode preserves the luminosity and saturation of the base pixels while adopting the hue of the blend pixels.'],
    ['saturation', 'The Saturation Blending Mode preserves the luminosity and hue of the base layer while adopting the saturation of the blend layer.'],
    ['color', 'The Color blend mode is a combination of Hue and Saturation. Only the color (the hues and their saturation values) from the layer is blended in with the layer or layers below it.'],
    ['luminosity', 'The Luminosity blend mode preserves the hue and chroma of the bottom layers, while adopting the luma of the top layer.']
  ]
  let uiCreated = false

  // Set up user interface
  function createBlendModesUI(div, viewer) {
    const table = e('table')
    div.appendChild(table)

    blendModes.forEach(item => {
      let name = item[0]
      let def = item[1]
      const blendBtn = e('button', {
        'type': 'button',
        'id': name.replace('-', '_'),
        'value': name,
        'class': 'btn hover-light css-tooltip',
        'style': 'width: 120px',
        'data-tooltip': def
      })
      blendBtn.innerHTML = name

      const row = e('tr', {}, [
        e('td', {'class':'tooltip'}, [blendBtn, e('br')])
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

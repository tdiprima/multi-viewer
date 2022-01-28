let layerPopup = function (divBody, allLayers, viewer) {
  // Color attenuation by probability
  function attenuation(allLayers, viewer) {
    let attId = makeId(5, 'atten')
    let label = e('label', {'for': attId})
    label.innerHTML = "&nbsp;&#58;&nbsp;color-attenuation by probability<br>"
    // Icon
    let icon = e('i', {
      'id': attId,
      'class': `fas fa-broadcast-tower hover-light`,
      'title': 'toggle: color-attenuation by probability'
    })
    // Event listener
    icon.addEventListener('click', () => {
      STATE.attenuate = !STATE.attenuate
      // Either outline is on or attenuate is on; not both. #attenuate
      STATE.outline = false
      setFilter(allLayers, viewer)
    })
    return [label, icon]
  }

  // un/fill polygon
  function outlineFun(allLayers, viewer) {
    let fillId = makeId(5, 'fill')
    let label = e('label', {'for': fillId})
    label.innerHTML = "&nbsp;&nbsp;&#58;&nbsp;un/fill polygon<br>"
    let emptyCircle = 'far'
    let filledCircle = 'fas'
    // Icon
    let icon = e('i', {
      'id': fillId,
      'class': `${filledCircle} fa-circle hover-light`,
      'title': 'fill un-fill'
    });
    // Event listener
    icon.addEventListener('click', () => {
      STATE.outline = !STATE.outline
      // Either outline is on or attenuate is on; not both. #outline
      STATE.attenuate = false
      toggleButton(icon, filledCircle, emptyCircle)
      setFilter(allLayers, viewer)
    })
    return [label, icon]
  }

  function sliderWrapper(d, t, allLayers, viewer) {
    // Wrapper DIV
    let wrapper = e('div', {
      'class': d.class,
      'role': 'group',
      'aria-labelledby': 'multi-lbl',
      'style': `--${d.aLab}: ${d.aInit}; --${d.bLab}: ${d.bInit}; --min: ${d.min}; --max: ${d.max}`
    })

    // multi-label
    let title = e('div', {'id': 'multi-lbl'})
    title.innerHTML = t
    wrapper.appendChild(title)

    // Inputs
    let ARange = e('input', {'id': d.aLab, 'type': 'range', 'min': d.min, 'max': d.max, 'value': d.aInit})
    let BRange = e('input', {'id': d.bLab, 'type': 'range', 'min': d.min, 'max': d.max, 'value': d.bInit})

    // To display the current values:
    // let displayElement = e('output')
    // if (d.type === 'outside') {
    //   displayElement.innerHTML = `0 - ${ARange.value} and ${BRange.value} - 255`
    // } else {
    //   displayElement.innerHTML = `${ARange.value} - ${BRange.value}`
    // }

    let output1 = e('output', {'for': d.aLab, 'style': `--c: var(--${d.aLab})`})
    let output2 = e('output', {'for': d.bLab, 'style': `--c: var(--${d.bLab})`})

    wrapper.appendChild(ARange)
    wrapper.appendChild(output1)
    wrapper.appendChild(BRange)
    wrapper.appendChild(output2)

    // Update custom properties on wrapper
    function updateProps(e) {
      const input = e.target
      const wrapper = input.parentNode
      wrapper.style.setProperty(`--${input.id}`, +input.value)

      // Get values:
      let slideVals = getVals([ARange, BRange])

      // Display values:
      if (d.type === 'outside') {
        // output1.innerHTML = `0 - ${slideVals[0]} and ${slideVals[1]} - 255`
        setFilter(allLayers, viewer, {'min': slideVals[0], 'max': slideVals[1], 'type': 'outside'})
      } else {
        // output1.innerHTML = `${slideVals[0]} - ${slideVals[1]}`
        setFilter(allLayers, viewer, {'min': slideVals[0], 'max': slideVals[1], 'type': 'inside'})
      }
    }

    ARange.addEventListener('input', updateProps)
    BRange.addEventListener('input', updateProps)

    return wrapper
  }

  // COLOR ATTENUATION BY PROBABILITY
  let [label1, atten] = attenuation(allLayers, viewer)

  // UN/FILL POLYGON
  let [label2, fillPoly] = outlineFun(allLayers, viewer)
  divBody.appendChild(e('div', {}, [atten, label1, fillPoly, label2]))

  // DUAL-POINT SLIDERS
  let d = { 'aLab': 'a', 'bLab': 'b', 'aInit': 70, 'bInit': 185, 'min': 0, 'max': 255, 'class': 'dualSlider', 'type': 'inside' }
  const wrapper = sliderWrapper(d, 'In range:', allLayers, viewer)

  d = { 'aLab': 'a1', 'bLab': 'b1', 'aInit': 10, 'bInit': 245, 'min': 0, 'max': 255, 'class': 'dualSlider1', 'type': 'outside' }
  const section = sliderWrapper(d, 'Out range:', allLayers, viewer)

  let dd = e('div', {}, [section, wrapper])
  divBody.appendChild(dd)
}

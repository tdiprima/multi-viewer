// Sliders Module
const Sliders = function () {
  let sliderIdNum = 0

  return {
    createSliders: function (idx, div, howManyToCreate, options) {
      const sliders = []
      const d = document.createDocumentFragment()

      for (let i = 0; i < howManyToCreate; i++) {
        const range = document.createElement('input')
        range.type = 'range'
        sliderIdNum += 1
        range.id = 'sliderRange' + sliderIdNum
        range.min = '0'
        range.max = '100'
        range.value = '100'
        range.setAttribute('class', 'slider-square')
        if (options.toolbarOn) {
          range.style.display = 'none'
        } else {
          range.style.display = 'inline' // bc we have a btn to toggle it
        }

        d.appendChild(range) // append div to fragment
        div.appendChild(d) // append fragment to parent
        sliders.push(range)
      }
      return sliders
    },
    sliderButtonEvent: function (idx, sliders) {
      const btnSlide = document.getElementById('btnSlide' + idx)

      if (isRealValue(btnSlide)) {
        btnSlide.addEventListener('click', function () {
          // (2) sliders.
          if (sliders[0].style.display === 'none') { // no need to check both; just the one.
            // Show the sliders
            sliders[0].style.display = 'inline'
            sliders[1].style.display = 'inline'

            // Style the button
            this.innerHTML = '<i class="fa fa-sliders"></i> Hide sliders'
          } else {
            // Hide the sliders
            sliders[0].style.display = 'none'
            sliders[1].style.display = 'none'

            // Style the button
            this.innerHTML = '<i class="fa fa-sliders"></i> Show sliders'
          }
          toggleButtonHighlight(btnSlide)
        })
      }
    }
  }
}
